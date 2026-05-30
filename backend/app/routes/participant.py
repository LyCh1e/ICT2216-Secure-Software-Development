import hashlib
import re
import uuid
from datetime import datetime

import bcrypt
from flask import Blueprint, jsonify, request, session

from app.extensions import db, mongo
from app.middleware import owns_resource, require_role
from app.models.models import ConsentRecord, Participant, Trial, User
from app.services.audit import write_audit
from app.services.vault import create_pii, erase_pii

participant_bp = Blueprint('participant', __name__)

_EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def _ip():
    return request.headers.get('X-Forwarded-For', request.remote_addr)


def _password_ok(pw):
    return (
        len(pw) >= 8
        and re.search(r'[A-Z]', pw)
        and re.search(r'[a-z]', pw)
        and re.search(r'\d', pw)
        and re.search(r'[^A-Za-z0-9]', pw)
    )


# ── Trials listing (public) ───────────────────────────────────────────────────

@participant_bp.route('/trials', methods=['GET'])
def list_trials():
    trials = Trial.query.filter_by(status='recruiting').all()
    return jsonify([{
        'trial_id':       t.trial_id,
        'title':          t.title,
        'description':    t.description,
        'phase':          t.phase,
        'sponsor':        t.sponsor,
        'duration':       t.duration,
        'stipend':        t.stipend,
        'risk_level':     t.risk_level,
        'spots_total':    t.spots_total,
        'spots_enrolled': t.spots_enrolled,
        'location':       t.location,
    } for t in trials]), 200


# ── Profile ───────────────────────────────────────────────────────────────────

@participant_bp.route('/participant/profile', methods=['GET'])
@require_role('participant')
def get_profile():
    user = db.session.get(User, session['user_id'])
    participant = Participant.query.filter_by(user_id=user.user_id).first()

    return jsonify({
        'user_id':        user.user_id,
        'username':       user.username,
        'email':          user.email,
        'role':           user.role,
        'email_verified': user.email_verified,
        'mfa_enabled':    user.mfa_enabled,
        'created_at':     user.created_at.isoformat(),
        'last_login':     user.last_login.isoformat() if user.last_login else None,
        'participant': {
            'participant_id':      participant.participant_id,
            'trial_id':            participant.trial_id,
            'consent_status':      participant.consent_status,
            'withdrawal_triggered': participant.withdrawal_triggered,
        } if participant else None,
    }), 200


@participant_bp.route('/participant/profile', methods=['PUT'])
@require_role('participant')
def update_profile():
    data     = request.get_json(silent=True) or {}
    user     = db.session.get(User, session['user_id'])
    new_email    = data.get('email')
    new_password = data.get('password')

    # Re-authentication required before changing email or password
    if new_email or new_password:
        current_password = str(data.get('current_password', ''))
        if not bcrypt.checkpw(current_password.encode(), user.password_hash.encode()):
            write_audit('profile_update', 'failure', user_id=user.user_id, ip_address=_ip())
            return jsonify({'error': 'Current password is incorrect.'}), 403

    if new_email:
        new_email = str(new_email).strip().lower()
        if not _EMAIL_RE.match(new_email):
            return jsonify({'error': 'Invalid email format.'}), 400
        user.email = new_email
        write_audit('profile_update', 'success', user_id=user.user_id,
                    resource_affected='email', ip_address=_ip())

    if new_password:
        new_password = str(new_password)
        if not _password_ok(new_password):
            return jsonify({'error': 'Password does not meet complexity requirements.'}), 400
        user.password_hash = bcrypt.hashpw(
            new_password.encode(), bcrypt.gensalt(rounds=12)
        ).decode()
        write_audit('profile_update', 'success', user_id=user.user_id,
                    resource_affected='password', ip_address=_ip())

    db.session.commit()
    return jsonify({'message': 'Profile updated.'}), 200


# ── Trial enrolment ───────────────────────────────────────────────────────────

@participant_bp.route('/trials/<trial_id>/apply', methods=['POST'])
@require_role('participant')
def apply_to_trial(trial_id):
    data    = request.get_json(silent=True) or {}
    user_id = session['user_id']

    trial = db.session.get(Trial, trial_id)
    if not trial or trial.status != 'recruiting':
        return jsonify({'error': 'Trial not available.'}), 404

    if trial.spots_enrolled >= trial.spots_total:
        return jsonify({'error': 'Trial is full.'}), 409

    existing = Participant.query.filter_by(user_id=user_id, trial_id=trial_id).first()
    if existing:
        return jsonify({'error': 'Already enrolled in this trial.'}), 409

    consent_version = str(data.get('consent_text_version', '')).strip()
    digital_sig     = str(data.get('digital_signature', '')).strip()
    if not consent_version or not digital_sig:
        write_audit('consent_submit', 'failure', user_id=user_id,
                    resource_affected=trial_id, ip_address=_ip())
        return jsonify({'error': 'Consent form must be completed.'}), 400

    user  = db.session.get(User, user_id)
    token = create_pii(user_id=user_id, email=user.email)
    if not token:
        write_audit('consent_submit', 'failure', user_id=user_id,
                    resource_affected=trial_id, ip_address=_ip())
        return jsonify({'error': 'Enrolment failed. Please try again.'}), 500

    participant_id = str(uuid.uuid4())
    sig_hash = hashlib.sha256(
        f"{participant_id}{digital_sig}{datetime.utcnow().isoformat()}".encode()
    ).hexdigest()

    db.session.add(Participant(
        participant_id=participant_id,
        pseudonym_token=token,
        user_id=user_id,
        trial_id=trial_id,
        consent_status='active',
    ))
    db.session.add(ConsentRecord(
        consent_id=str(uuid.uuid4()),
        participant_id=participant_id,
        trial_id=trial_id,
        consent_text_version=consent_version,
        digital_signature_hash=sig_hash,
    ))
    trial.spots_enrolled += 1
    db.session.commit()

    write_audit('consent_submit', 'success', user_id=user_id,
                resource_affected=trial_id, ip_address=_ip())
    return jsonify({'message': 'Enrolled successfully.', 'pseudonym_token': token}), 201


# ── Health telemetry ──────────────────────────────────────────────────────────

@participant_bp.route('/health/submit', methods=['POST'])
@require_role('participant')
def submit_health():
    data    = request.get_json(silent=True) or {}
    user_id = session['user_id']

    participant = Participant.query.filter_by(
        user_id=user_id, consent_status='active'
    ).first()
    if not participant:
        return jsonify({'error': 'No active trial enrolment.'}), 403

    # Explicit type casting on all fields prevents NoSQL operator injection
    measurement_type = str(data.get('measurement_type', '')).strip()
    unit             = str(data.get('unit', '')).strip()
    recorded_at      = str(data.get('recorded_at', '')).strip()

    try:
        value = float(data['value'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'Invalid input.'}), 400

    if not measurement_type or not unit or not recorded_at:
        return jsonify({'error': 'Invalid input.'}), 400

    mongo.db.health_telemetry.insert_one({
        'pseudonym_token':  participant.pseudonym_token,
        'trial_id':         participant.trial_id,
        'measurement_type': measurement_type,
        'value':            value,
        'unit':             unit,
        'recorded_at':      recorded_at,
        'submitted_at':     datetime.utcnow().isoformat(),
    })

    write_audit('health_data_submit', 'success', user_id=user_id,
                resource_affected=participant.trial_id, ip_address=_ip())
    return jsonify({'message': 'Health data submitted.'}), 201


# ── Withdrawal ────────────────────────────────────────────────────────────────

@participant_bp.route('/trials/<trial_id>/withdraw', methods=['POST'])
@require_role('participant')
def withdraw(trial_id):
    user_id = session['user_id']

    participant = Participant.query.filter_by(
        user_id=user_id, trial_id=trial_id
    ).first()

    if not participant:
        return jsonify({'error': 'Enrolment not found.'}), 404

    # IDOR check — belt-and-suspenders on top of the query filter
    if not owns_resource(participant.user_id):
        return jsonify({'error': 'Forbidden'}), 403

    if participant.withdrawal_triggered:
        return jsonify({'error': 'Withdrawal already processed.'}), 409

    if not erase_pii(participant.pseudonym_token):
        write_audit('withdrawal', 'failure', user_id=user_id,
                    resource_affected=trial_id, ip_address=_ip())
        return jsonify({'error': 'Withdrawal failed. Please try again.'}), 500

    participant.consent_status      = 'withdrawn'
    participant.withdrawal_triggered = True

    consent = ConsentRecord.query.filter_by(
        participant_id=participant.participant_id, trial_id=trial_id
    ).first()
    if consent:
        consent.withdrawn_at = datetime.utcnow()

    db.session.commit()

    write_audit('withdrawal', 'success', user_id=user_id,
                resource_affected=trial_id, ip_address=_ip())
    return jsonify({'message': 'Withdrawal processed. Your personal data has been erased.'}), 200
