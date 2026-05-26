import hashlib
from datetime import datetime

from app.extensions import db
from app.models.models import AuditLog


def _entry_hash(prev_hash, timestamp, user_id, action_type, outcome):
    raw = f"{prev_hash or ''}{timestamp.isoformat()}{user_id or ''}{action_type}{outcome}"
    return hashlib.sha256(raw.encode()).hexdigest()


def write_audit(action_type, outcome, user_id=None, resource_affected=None, ip_address=None):
    last = db.session.query(AuditLog).order_by(AuditLog.log_id.desc()).first()
    prev_hash = last.entry_hash if last else None
    now = datetime.utcnow()
    AuditLog.create(
        user_id=user_id,
        action_type=action_type,
        resource_affected=resource_affected,
        outcome=outcome,
        ip_address=ip_address,
        timestamp=now,
        prev_hash=prev_hash,
        entry_hash=_entry_hash(prev_hash, now, user_id, action_type, outcome),
    )
