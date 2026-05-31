from datetime import datetime
from app.extensions import db


class User(db.Model):
    __tablename__ = 'users'

    user_id               = db.Column(db.String(36),  primary_key=True)
    username              = db.Column(db.String(64),  nullable=False, unique=True)
    email                 = db.Column(db.String(254), nullable=False, unique=True)
    password_hash         = db.Column(db.String(255), nullable=False)
    role                  = db.Column(db.Enum('participant', 'researcher', 'admin'), nullable=False)
    email_verified        = db.Column(db.Boolean, nullable=False, default=False)
    mfa_secret            = db.Column(db.String(64),  default=None)
    mfa_enabled           = db.Column(db.Boolean, nullable=False, default=False)
    failed_login_attempts = db.Column(db.Integer, nullable=False, default=0)
    locked_until          = db.Column(db.DateTime, default=None)
    created_at            = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login            = db.Column(db.DateTime, default=None)

    participants = db.relationship('Participant', backref='user', lazy=True)


class Trial(db.Model):
    __tablename__ = 'trials'

    trial_id       = db.Column(db.String(36),  primary_key=True)
    title          = db.Column(db.String(255), nullable=False)
    description    = db.Column(db.Text,        nullable=False)
    phase          = db.Column(db.String(32),  nullable=False)
    sponsor        = db.Column(db.String(255), nullable=False)
    duration       = db.Column(db.String(64),  nullable=False)
    stipend        = db.Column(db.String(64),  nullable=False, default='Unpaid')
    risk_level     = db.Column(db.Enum('minimal', 'low', 'medium', 'high'), nullable=False)
    spots_total    = db.Column(db.Integer, nullable=False)
    spots_enrolled = db.Column(db.Integer, nullable=False, default=0)
    location       = db.Column(db.String(255), nullable=False)
    status         = db.Column(db.Enum('recruiting', 'closed', 'completed'), nullable=False, default='recruiting')
    created_at     = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    participants   = db.relationship('Participant', backref='trial', lazy=True)


class Participant(db.Model):
    __tablename__ = 'participants'

    participant_id       = db.Column(db.String(36), primary_key=True)
    pseudonym_token      = db.Column(db.String(64), nullable=False, unique=True, index=True)
    user_id              = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    trial_id             = db.Column(db.String(36), db.ForeignKey('trials.trial_id'), nullable=False)
    consent_status       = db.Column(db.Enum('pending', 'active', 'withdrawn'), nullable=False, default='pending')
    withdrawal_triggered = db.Column(db.Boolean, nullable=False, default=False)
    created_at           = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    consent_records = db.relationship('ConsentRecord', backref='participant', lazy=True)


class ConsentRecord(db.Model):
    __tablename__ = 'consent_records'

    consent_id             = db.Column(db.String(36),  primary_key=True)
    participant_id         = db.Column(db.String(36),  db.ForeignKey('participants.participant_id'), nullable=False)
    trial_id               = db.Column(db.String(36),  db.ForeignKey('trials.trial_id'), nullable=False)
    consent_text_version   = db.Column(db.String(64),  nullable=False)
    signed_at              = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)
    digital_signature_hash = db.Column(db.String(128), nullable=False)
    withdrawn_at           = db.Column(db.DateTime,    default=None)


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    log_id            = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id           = db.Column(db.String(36), default=None)
    action_type       = db.Column(db.String(64), nullable=False)
    resource_affected = db.Column(db.String(255), default=None)
    outcome           = db.Column(db.Enum('success', 'failure'), nullable=False)
    ip_address        = db.Column(db.String(45), default=None)
    timestamp         = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    prev_hash         = db.Column(db.String(64), default=None)
    entry_hash        = db.Column(db.String(64), nullable=False)

    # No update() or delete() — enforced at DB level via GRANT and here by omission
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    @classmethod
    def create(cls, **kwargs):
        record = cls(**kwargs)
        db.session.add(record)
        db.session.commit()
        return record
