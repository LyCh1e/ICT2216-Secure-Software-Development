import os
from datetime import timedelta


class BaseConfig:
    SECRET_KEY = os.environ['FLASK_SECRET_KEY']

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.environ['DB_USER']}:{os.environ['DB_PASS']}"
        f"@{os.environ['DB_HOST']}:{os.environ.get('DB_PORT', '3306')}/{os.environ['DB_NAME']}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MONGO_URI = (
        f"mongodb://{os.environ['MONGO_USER']}:{os.environ['MONGO_PASS']}"
        f"@{os.environ['MONGO_HOST']}:{os.environ.get('MONGO_PORT', '27017')}"
        f"/{os.environ['MONGO_DB_NAME']}?authSource=admin"
    )

    SESSION_COOKIE_HTTPONLY  = True
    SESSION_COOKIE_SECURE    = True
    SESSION_COOKIE_SAMESITE  = 'Strict'
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)

    WTF_CSRF_ENABLED    = True
    WTF_CSRF_TIME_LIMIT = 3600

    VAULT_URL           = os.environ['VAULT_URL']
    VAULT_SHARED_SECRET = os.environ['VAULT_SHARED_SECRET']


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SESSION_COOKIE_SECURE = False  # No HTTPS in local dev

class ProductionConfig(BaseConfig):
    DEBUG = False
