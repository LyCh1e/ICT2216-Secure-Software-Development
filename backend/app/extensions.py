from flask import request
from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_cors import CORS


def _real_ip():
    # Behind nginx, X-Real-IP is set to the actual client IP.
    # Falls back to remote_addr for local dev (no proxy).
    return request.headers.get('X-Real-IP') or request.remote_addr


db = SQLAlchemy()
mongo = PyMongo()
csrf = CSRFProtect()
limiter = Limiter(key_func=_real_ip)
cors = CORS()
