import base64
import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime
from functools import wraps

import pymysql
import pymysql.cursors
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from flask import Flask, g, jsonify, request

app = Flask(__name__)

_SHARED_SECRET = os.environ.get('VAULT_SHARED_SECRET', '')
_ENC_KEY_HEX   = os.environ.get('VAULT_ENCRYPTION_KEY', '')
_ENC_KEY       = bytes.fromhex(_ENC_KEY_HEX) if len(_ENC_KEY_HEX) == 64 else None

_DB_CONFIG = {
    'host':        os.environ.get('VAULT_DB_HOST', 'vault_db'),
    'port':        int(os.environ.get('VAULT_DB_PORT', '3306')),
    'user':        os.environ.get('VAULT_DB_USER'),
    'password':    os.environ.get('VAULT_DB_PASS'),
    'database':    os.environ.get('VAULT_DB_NAME'),
    'charset':     'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
}


# ── DB helpers ────────────────────────────────────────────────────────────────

def _get_db():
    if 'db' not in g:
        g.db = pymysql.connect(**_DB_CONFIG)
    return g.db


@app.teardown_appcontext
def _close_db(e=None):
    db = g.pop('db', None)
    if db:
        db.close()


# ── Auth decorator ────────────────────────────────────────────────────────────

def _require_secret(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get('X-Vault-Secret') != _SHARED_SECRET:
            return jsonify({'error': 'Unauthorised'}), 401
        return f(*args, **kwargs)
    return decorated


# ── Crypto helpers ────────────────────────────────────────────────────────────

def _encrypt(plaintext: str) -> str:
    """AES-256-GCM encrypt. Returns base64(12-byte nonce || ciphertext+tag)."""
    if _ENC_KEY is None:
        raise RuntimeError("VAULT_ENCRYPTION_KEY not configured")
    nonce  = secrets.token_bytes(12)
    ct     = AESGCM(_ENC_KEY).encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()


def _make_token(user_id: str, salt: str) -> str:
    """Per-participant salted HMAC-SHA256 pseudonym token."""
    if _ENC_KEY is None:
        raise RuntimeError("VAULT_ENCRYPTION_KEY not configured")
    return hmac.new(
        _ENC_KEY,
        f"{user_id}{salt}".encode(),
        hashlib.sha256,
    ).hexdigest()


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200


@app.route('/vault/create', methods=['POST'])
@_require_secret
def create():
    if not _ENC_KEY:
        return jsonify({'error': 'Vault misconfigured — check VAULT_ENCRYPTION_KEY.'}), 500

    data    = request.get_json(silent=True) or {}
    user_id = str(data.get('user_id', '')).strip()
    email   = str(data.get('email',   '')).strip()

    if not user_id or not email:
        return jsonify({'error': 'Missing required fields.'}), 400

    salt  = secrets.token_hex(32)   # 64-char unique salt per enrolment
    token = _make_token(user_id, salt)

    db = _get_db()
    with db.cursor() as cur:
        # Guard against token collision (astronomically unlikely)
        cur.execute(
            'SELECT vault_id FROM vault_records WHERE pseudonym_token = %s',
            (token,)
        )
        if cur.fetchone():
            return jsonify({'error': 'Token collision — please retry.'}), 409

        cur.execute(
            '''INSERT INTO vault_records
                   (vault_id, pseudonym_token, salt, enc_email)
               VALUES (%s, %s, %s, %s)''',
            (str(uuid.uuid4()), token, salt, _encrypt(email)),
        )
    db.commit()

    return jsonify({'pseudonym_token': token}), 201


@app.route('/vault/erase/<pseudonym_token>', methods=['POST'])
@_require_secret
def erase(pseudonym_token):
    db = _get_db()
    with db.cursor() as cur:
        cur.execute(
            'SELECT vault_id, purged_at FROM vault_records WHERE pseudonym_token = %s',
            (pseudonym_token,)
        )
        record = cur.fetchone()

    if not record:
        return jsonify({'error': 'Not found.'}), 404

    if record['purged_at']:
        return jsonify({'message': 'Already erased.'}), 200

    with db.cursor() as cur:
        cur.execute(
            '''UPDATE vault_records
               SET enc_real_name      = NULL,
                   enc_email          = NULL,
                   enc_date_of_birth  = NULL,
                   enc_contact_number = NULL,
                   purged_at          = %s
               WHERE pseudonym_token  = %s''',
            (datetime.utcnow(), pseudonym_token),
        )
    db.commit()

    return jsonify({'message': 'PII erased.'}), 200
