import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.middleware import require_role
from app.models.models import AuditLog, ConsentRecord, Participant, Trial, User
from app.services.audit import write_audit

admin_bp = Blueprint('admin', __name__)

_TRIAL_FIELDS = frozenset({
    'title', 'description', 'phase', 'sponsor', 'duration',
    'stipend', 'risk_level', 'spots_total', 'location',
})

_FIELD_MAX_LENS = {
    'title': 255, 'phase': 32, 'sponsor': 255,
    'duration': 64, 'stipend': 64, 'location': 255,
}


def _extra_fields(data, allowed):
    return set(data.keys()) - allowed


def _ip():
    return request.headers.get('X-Forwarded-For', request.remote_addr)


# ── Users ─────────────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@require_role('admin')
def list_users():
    users = User.query.all()
    return jsonify([{
        'user_id':        u.user_id,
        'username':       u.username,
        'email':          u.email,
        'role':           u.role,
        'email_verified': u.email_verified,
        'mfa_enabled':    u.mfa_enabled,
        'suspended':      bool(u.locked_until and u.locked_until.year == 9999),
        'locked_until':   u.locked_until.isoformat() if u.locked_until else None,
        'created_at':     u.created_at.isoformat(),
        'last_login':     u.last_login.isoformat() if u.last_login else None,
    } for u in users]), 200


@admin_bp.route('/users/<user_id>/suspend', methods=['POST'])
@require_role('admin')
def suspend_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    # Sentinel far-future date marks account as admin-suspended
    user.locked_until = datetime(9999, 12, 31, 23, 59, 59)
    db.session.commit()

    write_audit('account_suspend', 'success', user_id=session['user_id'],
                resource_affected=user_id, ip_address=_ip())
    return jsonify({'message': 'Account suspended.'}), 200


@admin_bp.route('/users/<user_id>/activate', methods=['POST'])
@require_role('admin')
def activate_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    user.locked_until          = None
    user.failed_login_attempts = 0
    db.session.commit()

    write_audit('account_activate', 'success', user_id=session['user_id'],
                resource_affected=user_id, ip_address=_ip())
    return jsonify({'message': 'Account activated.'}), 200


# ── Trials ────────────────────────────────────────────────────────────────────

@admin_bp.route('/trials', methods=['GET'])
@require_role('admin')
def list_trials():
    trials = Trial.query.all()
    return jsonify([{
        'trial_id':       t.trial_id,
        'title':          t.title,
        'phase':          t.phase,
        'sponsor':        t.sponsor,
        'status':         t.status,
        'risk_level':     t.risk_level,
        'spots_total':    t.spots_total,
        'spots_enrolled': t.spots_enrolled,
        'created_at':     t.created_at.isoformat(),
    } for t in trials]), 200


@admin_bp.route('/trials', methods=['POST'])
@require_role('admin')
def create_trial():
    data = request.get_json(silent=True) or {}

    if _extra_fields(data, _TRIAL_FIELDS):
        write_audit('unexpected_input', 'failure', user_id=session['user_id'], ip_address=_ip())
        return jsonify({'error': 'Invalid input.'}), 400

    required = ['title', 'description', 'phase', 'sponsor', 'duration', 'risk_level',
                'spots_total', 'location']
    for field in required:
        if not str(data.get(field, '')).strip():
            return jsonify({'error': f'Missing required field: {field}'}), 400

    for field, max_len in _FIELD_MAX_LENS.items():
        if field in data and len(str(data[field])) > max_len:
            return jsonify({'error': f'Field {field} exceeds maximum length.'}), 400

    if data['risk_level'] not in ('minimal', 'low', 'medium', 'high'):
        return jsonify({'error': 'Invalid risk_level.'}), 400

    try:
        spots = int(data['spots_total'])
        if spots <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid spots_total.'}), 400

    trial_id = str(uuid.uuid4())
    db.session.add(Trial(
        trial_id=trial_id,
        title=str(data['title'])[:255],
        description=str(data['description']),
        phase=str(data['phase'])[:32],
        sponsor=str(data['sponsor'])[:255],
        duration=str(data['duration'])[:64],
        stipend=str(data.get('stipend', 'Unpaid'))[:64],
        risk_level=data['risk_level'],
        spots_total=spots,
        location=str(data['location'])[:255],
    ))
    db.session.commit()

    write_audit('trial_create', 'success', user_id=session['user_id'],
                resource_affected=trial_id, ip_address=_ip())
    return jsonify({'message': 'Trial created.', 'trial_id': trial_id}), 201


# ── Compliance report ─────────────────────────────────────────────────────────

@admin_bp.route('/compliance-report', methods=['GET'])
@require_role('admin')
def compliance_report():
    users_by_role = (
        db.session.query(User.role, db.func.count(User.user_id))
        .group_by(User.role)
        .all()
    )
    trials_by_status = (
        db.session.query(Trial.status, db.func.count(Trial.trial_id))
        .group_by(Trial.status)
        .all()
    )
    trials_by_risk = (
        db.session.query(Trial.risk_level, db.func.count(Trial.trial_id))
        .group_by(Trial.risk_level)
        .all()
    )

    total_participants   = Participant.query.count()
    active_participants  = Participant.query.filter_by(consent_status='active').count()
    withdrawn            = Participant.query.filter_by(consent_status='withdrawn').count()
    pii_purged           = Participant.query.filter_by(withdrawal_triggered=True).count()

    total_consents  = ConsentRecord.query.count()
    active_consents = ConsentRecord.query.filter(ConsentRecord.withdrawn_at.is_(None)).count()

    total_audit_events = AuditLog.query.count()
    failures           = AuditLog.query.filter_by(outcome='failure').count()

    report = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'users': {
            'total': sum(c for _, c in users_by_role),
            'by_role': {role: count for role, count in users_by_role},
        },
        'trials': {
            'total': sum(c for _, c in trials_by_status),
            'by_status': {s: c for s, c in trials_by_status},
            'by_risk_level': {r: c for r, c in trials_by_risk},
        },
        'participants': {
            'total':             total_participants,
            'active':            active_participants,
            'withdrawn':         withdrawn,
            'pii_purged':        pii_purged,
        },
        'consents': {
            'total':  total_consents,
            'active': active_consents,
        },
        'audit_log': {
            'total_events': total_audit_events,
            'failure_events': failures,
        },
    }

    write_audit('compliance_report_export', 'success', user_id=session['user_id'],
                ip_address=_ip())
    return jsonify(report), 200


# ── Audit log ─────────────────────────────────────────────────────────────────

@admin_bp.route('/audit-log', methods=['GET'])
@require_role('admin')
def get_audit_log():
    page     = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)

    paginated = (AuditLog.query
                 .order_by(AuditLog.log_id.desc())
                 .paginate(page=page, per_page=per_page, error_out=False))

    return jsonify({
        'total':    paginated.total,
        'page':     page,
        'per_page': per_page,
        'logs': [{
            'log_id':            l.log_id,
            'user_id':           l.user_id,
            'action_type':       l.action_type,
            'resource_affected': l.resource_affected,
            'outcome':           l.outcome,
            'ip_address':        l.ip_address,
            'timestamp':         l.timestamp.isoformat(),
        } for l in paginated.items],
    }), 200
