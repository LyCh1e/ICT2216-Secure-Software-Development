from functools import wraps
from flask import jsonify, session


def require_role(*roles):
    """Enforce authentication and role-based access on a route.

    Usage:
        @require_role('participant')
        @require_role('admin', 'researcher')   # accepts either role
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Unauthorised'}), 401
            if session.get('role') not in roles:
                return jsonify({'error': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


def owns_resource(resource_user_id):
    """IDOR check — returns True only if the session user owns the resource.

    Usage in a route:
        if not owns_resource(record.user_id):
            return jsonify({'error': 'Forbidden'}), 403
    """
    return session.get('user_id') == str(resource_user_id)
