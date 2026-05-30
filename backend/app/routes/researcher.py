from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.middleware import require_role
from app.models.models import Participant, Trial
from app.services.audit import write_audit

researcher_bp = Blueprint('researcher', __name__)


def _ip():
    return request.headers.get('X-Forwarded-For', request.remote_addr)


@researcher_bp.route('/trials', methods=['GET'])
@require_role('researcher')
def list_trials():
    trials = Trial.query.all()
    write_audit('researcher_data_access', 'success', user_id=session['user_id'],
                resource_affected='trials', ip_address=_ip())
    return jsonify([{
        'trial_id':       t.trial_id,
        'title':          t.title,
        'phase':          t.phase,
        'sponsor':        t.sponsor,
        'status':         t.status,
        'spots_total':    t.spots_total,
        'spots_enrolled': t.spots_enrolled,
    } for t in trials]), 200


@researcher_bp.route('/trials/<trial_id>/stats', methods=['GET'])
@require_role('researcher')
def trial_stats(trial_id):
    trial = db.session.get(Trial, trial_id)
    if not trial:
        return jsonify({'error': 'Not found'}), 404

    # Aggregate counts only — no individual records or pseudonym tokens exposed
    total     = Participant.query.filter_by(trial_id=trial_id).count()
    active    = Participant.query.filter_by(trial_id=trial_id, consent_status='active').count()
    withdrawn = Participant.query.filter_by(trial_id=trial_id, consent_status='withdrawn').count()

    write_audit('researcher_data_access', 'success', user_id=session['user_id'],
                resource_affected=trial_id, ip_address=_ip())
    return jsonify({
        'trial_id':              trial_id,
        'title':                 trial.title,
        'status':                trial.status,
        'total_enrolled':        total,
        'active_participants':   active,
        'withdrawn_participants': withdrawn,
        'withdrawal_rate':       round(withdrawn / total * 100, 1) if total else 0,
    }), 200
