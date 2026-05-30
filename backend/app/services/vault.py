import os
import urllib.request
import urllib.error
import json

_VAULT_URL           = os.environ.get('VAULT_URL', 'http://pii_vault:8888')
_VAULT_SHARED_SECRET = os.environ.get('VAULT_SHARED_SECRET', '')


def _request(method, path, body=None):
    url  = f"{_VAULT_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(
        url, data=data, method=method,
        headers={
            'Content-Type':    'application/json',
            'X-Vault-Secret':  _VAULT_SHARED_SECRET,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception:
        return None, {}


def create_pii(user_id, email):
    """Store PII in the vault and return the pseudonym token, or None on failure."""
    status, body = _request('POST', '/vault/create', {'user_id': user_id, 'email': email})
    if status == 201:
        return body.get('pseudonym_token')
    return None


def erase_pii(pseudonym_token):
    """Trigger PII erasure for the given token. Returns True on success."""
    status, _ = _request('POST', f'/vault/erase/{pseudonym_token}')
    return status == 200
