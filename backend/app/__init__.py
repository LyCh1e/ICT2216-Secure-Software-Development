from flask import Flask, jsonify
from config import DevelopmentConfig, ProductionConfig
from app.extensions import db, mongo, csrf, limiter, cors
from app.errors import register_error_handlers
import os


def create_app():
    app = Flask(__name__)

    env = os.getenv('FLASK_ENV', 'production')
    app.config.from_object(DevelopmentConfig if env == 'development' else ProductionConfig)

    db.init_app(app)
    mongo.init_app(app)
    csrf.init_app(app)
    limiter.init_app(app)

    if env == 'development':
        cors.init_app(app, resources={r'/api/*': {'origins': 'http://localhost:5173'}})

    register_error_handlers(app)

    from app.routes.auth import auth_bp
    from app.routes.participant import participant_bp
    from app.routes.researcher import researcher_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp,        url_prefix='/api/auth')
    app.register_blueprint(participant_bp, url_prefix='/api')
    app.register_blueprint(researcher_bp, url_prefix='/api/researcher')
    app.register_blueprint(admin_bp,       url_prefix='/api/admin')

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    return app
