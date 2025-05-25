from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from .config import Config
from .utils.session_tracker import SessionTracker
import os
import pytz

db = SQLAlchemy()

def create_app(config_name=None):
    app = Flask(__name__)
    if config_name == 'testing':
        from .config import TestingConfig
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(Config)
    app.jinja_env.filters['vn_datetime'] = vn_datetime
    db.init_app(app)

    from .views import views
    from .auth import auth
    from .api import api
    from .admin import admin

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(admin, url_prefix='/admin')

    from .models import User
    
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.before_request
    def track_user_activity():
        if current_user.is_authenticated:
            SessionTracker.update_session()

    create_database(app)
    return app

def create_database(app):
    if not os.path.exists('website/database.db'):
        with app.app_context():
            db.create_all() 
        print('Created database!')

def vn_datetime(value):
    tz = pytz.timezone("Asia/Ho_Chi_Minh")

    if value.tzinfo is None:
        value = value.replace(tzinfo=pytz.UTC)

    return value.astimezone(tz)