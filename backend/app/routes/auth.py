import hashlib
import re
import secrets
import uuid

import requests as http_requests
from datetime import datetime, timedelta

import bcrypt
import pyotp
from flask import Blueprint, jsonify, request, session
from flask_wtf.csrf import generate_csrf

from app.extensions import csrf, db, limiter
from app.models.models import User
from app.services.audit import write_audit
from app.services.email import send_verification_email

auth_bp = Blueprint('auth', __name__)
# JSON API — CSRF mitigated by SameSite=Strict + CORS restrictions
csrf.exempt(auth_bp)

_EMAIL_RE    = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
_USERNAME_RE = re.compile(r'^[a-zA-Z0-9_]{3,64}$')
_LOCKOUT_ATTEMPTS = 5
_LOCKOUT_MINUTES  = 15

# Pre-computed bcrypt hash used to equalise login timing when the user does not
# exist — prevents username enumeration via response-time differences (timing oracle).
_DUMMY_HASH = bcrypt.hashpw(b'timing-equalizer', bcrypt.gensalt(rounds=12))

_REGISTER_FIELDS = frozenset({'username', 'email', 'password'})
_LOGIN_FIELDS    = frozenset({'identifier', 'password'})
_MFA_FIELDS      = frozenset({'code'})


def _extra_fields(data, allowed):
    return set(data.keys()) - allowed


def _ip():
    # X-Real-IP is set by nginx to the true client IP ($remote_addr) and is not
    # client-spoofable, unlike X-Forwarded-For (which appends client-supplied values).
    # Falls back to remote_addr for local dev without a proxy.
    return request.headers.get('X-Real-IP') or request.remote_addr


def _password_ok(pw):
    return (
        len(pw) >= 8
        and re.search(r'[A-Z]', pw)
        and re.search(r'[a-z]', pw)
        and re.search(r'\d', pw)
        and re.search(r'[^A-Za-z0-9]', pw)
    )


def _is_pwned(password: str) -> bool:
    # Return True if the password appears in the HIBP Pwned Passwords dataset.
    # Uses k-anonymity: only the first 5 hex chars of the SHA-1 hash are sent to
    # HIBP, so the plaintext password never leaves this server.

    sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    try:
        resp = http_requests.get(
            f'https://api.pwnedpasswords.com/range/{prefix}',
            headers={'Add-Padding': 'true'},
            timeout=5,
        )
        resp.raise_for_status()
    except Exception:
        # Fail open: if HIBP is unreachable, don't block registration.
        return False
    for line in resp.text.splitlines():
        h, _, count = line.partition(':')
        if h == suffix:
            return True
    return False

# ── CSRF token endpoint ───────────────────────────────────────────────────────

@auth_bp.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    return jsonify({'csrf_token': generate_csrf()}), 200


# ── 4.1 Register ─────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
@limiter.limit('5 per minute')
def register():
    data     = request.get_json(silent=True) or {}

    if _extra_fields(data, _REGISTER_FIELDS):
        write_audit('unexpected_input', 'failure', ip_address=_ip())
        return jsonify({'error': 'Invalid input.'}), 400

    username = str(data.get('username', '')).strip()
    email    = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))

    if not _USERNAME_RE.match(username):
        return jsonify({'error': 'Invalid input.'}), 400
    if not _EMAIL_RE.match(email):
        return jsonify({'error': 'Invalid input.'}), 400
    if not _password_ok(password):
        return jsonify({'error': 'Password does not meet complexity requirements.'}), 400
    if _is_pwned(password):
        return jsonify({'error': 'This password has appeared in a data breach. Please choose a different password.'}), 400
    
    existing = User.query.filter(
        (User.email == email) | (User.username == username)
    ).first()
    if existing:
        write_audit('register', 'failure', resource_affected=email, ip_address=_ip())
        return jsonify({'error': 'Registration failed.'}), 409

    pw_hash    = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
    mfa_secret = pyotp.random_base32()
    user_id    = str(uuid.uuid4())

    raw_token   = secrets.token_urlsafe(32)
    token_hash  = hashlib.sha256(raw_token.encode()).hexdigest()
    token_expiry = datetime.utcnow() + timedelta(hours=24)

    db.session.add(User(
        user_id=user_id,
        username=username,
        email=email,
        password_hash=pw_hash,
        role='participant',
        mfa_secret=mfa_secret,
        email_verified=False,
        mfa_enabled=False,
        verify_token=token_hash,
        verify_token_expires=token_expiry,
    ))
    db.session.commit()

    send_verification_email(email, raw_token)

    totp_uri = pyotp.TOTP(mfa_secret).provisioning_uri(name=email, issuer_name='TrialGuard')
    write_audit('register', 'success', user_id=user_id, ip_address=_ip())
    return jsonify({'message': 'Registration successful.', 'totp_uri': totp_uri}), 201


# ── 4.2 Login ─────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
@limiter.limit('10 per minute')
def login():
    data = request.get_json(silent=True) or {}

    if _extra_fields(data, _LOGIN_FIELDS):
        write_audit('unexpected_input', 'failure', ip_address=_ip())
        return jsonify({'error': 'Invalid input.'}), 400

    identifier = str(data.get('identifier', '')).strip()
    password   = str(data.get('password', ''))
    ip         = _ip()

    user = User.query.filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    def _fail(user_id=None):
        write_audit('login', 'failure', user_id=user_id, ip_address=ip)
        return jsonify({'error': 'Invalid credentials.'}), 401

    if not user:
        # Run a dummy bcrypt comparison so a non-existent user takes the same time
        # as a real password check — prevents username enumeration via timing.
        bcrypt.checkpw(password.encode(), _DUMMY_HASH)
        return _fail()

    # Locked — return same generic error as wrong credentials
    if user.locked_until and user.locked_until > datetime.utcnow():
        return _fail(user.user_id)

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= _LOCKOUT_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=_LOCKOUT_MINUTES)
            write_audit('account_lockout', 'success', user_id=user.user_id, ip_address=ip)
        db.session.commit()
        return _fail(user.user_id)

    user.failed_login_attempts = 0
    db.session.commit()

    # Require a verified email before issuing any session. Reached only after a
    # correct password, so it does not leak account existence to anonymous callers.
    if not user.email_verified:
        write_audit('login', 'failure', user_id=user.user_id, ip_address=ip)
        return jsonify({'error': 'Please verify your email address before logging in.'}), 403

    session.clear()
    session['mfa_pending_user_id'] = user.user_id

    write_audit('login_step1', 'success', user_id=user.user_id, ip_address=ip)
    return jsonify({'message': 'Credentials verified. MFA required.'}), 200


# ── 4.3 Verify MFA ───────────────────────────────────────────────────────────

@auth_bp.route('/verify-mfa', methods=['POST'])
@limiter.limit('10 per minute')
def verify_mfa():
    pending = session.get('mfa_pending_user_id')
    if not pending:
        return jsonify({'error': 'No pending MFA session.'}), 401

    data = request.get_json(silent=True) or {}

    if _extra_fields(data, _MFA_FIELDS):
        write_audit('unexpected_input', 'failure', ip_address=_ip())
        return jsonify({'error': 'Invalid input.'}), 400

    code = str(data.get('code', '')).strip()
    ip   = _ip()

    user = db.session.get(User, pending)
    if not user:
        session.clear()
        return jsonify({'error': 'Invalid credentials.'}), 401

    if not pyotp.TOTP(user.mfa_secret).verify(code):
        write_audit('mfa_verify', 'failure', user_id=pending, ip_address=ip)
        return jsonify({'error': 'Invalid or expired MFA code.'}), 401

    # Regenerate session — prevents session fixation
    session.clear()
    session['user_id']  = user.user_id
    session['role']     = user.role
    session.permanent   = True

    first_setup      = not user.mfa_enabled
    user.mfa_enabled = True
    user.last_login  = datetime.utcnow()
    db.session.commit()

    if first_setup:
        write_audit('mfa_setup', 'success', user_id=user.user_id, ip_address=ip)
    write_audit('mfa_verify', 'success', user_id=user.user_id, ip_address=ip)
    return jsonify({'message': 'Login successful.', 'role': user.role}), 200


# ── 4.4 Logout ───────────────────────────────────────────────────────────────

@auth_bp.route('/logout', methods=['POST'])
def logout():
    user_id = session.get('user_id')
    session.clear()
    if user_id:
        write_audit('logout', 'success', user_id=user_id, ip_address=_ip())
    return jsonify({'message': 'Logged out.'}), 200


# ── Email verification ────────────────────────────────────────────────────────

@auth_bp.route('/verify-email', methods=['GET'])
def verify_email():
    raw_token = request.args.get('token', '').strip()
    if not raw_token:
        return jsonify({'error': 'Invalid or missing token.'}), 400

    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    user = User.query.filter_by(verify_token=token_hash).first()

    if not user:
        write_audit('email_verify', 'failure', ip_address=_ip())
        return jsonify({'error': 'Invalid or expired verification link.'}), 400

    if user.verify_token_expires < datetime.utcnow():
        write_audit('email_verify', 'failure', user_id=user.user_id, ip_address=_ip())
        return jsonify({'error': 'Verification link has expired. Please request a new one.'}), 400

    user.email_verified      = True
    user.verify_token        = None
    user.verify_token_expires = None
    db.session.commit()

    write_audit('email_verify', 'success', user_id=user.user_id, ip_address=_ip())
    return jsonify({'message': 'Email verified successfully. You can now log in.'}), 200


# ── Resend verification email ─────────────────────────────────────────────────

@auth_bp.route('/resend-verification', methods=['POST'])
@limiter.limit('3 per hour')
def resend_verification():
    data  = request.get_json(silent=True) or {}
    email = str(data.get('email', '')).strip().lower()

    if not _EMAIL_RE.match(email):
        return jsonify({'error': 'Invalid input.'}), 400

    user = User.query.filter_by(email=email).first()
    # Always return success to avoid email enumeration
    if user and not user.email_verified:
        raw_token   = secrets.token_urlsafe(32)
        token_hash  = hashlib.sha256(raw_token.encode()).hexdigest()
        user.verify_token         = token_hash
        user.verify_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        send_verification_email(email, raw_token)

    return jsonify({'message': 'If that email is registered and unverified, a new link has been sent.'}), 200
