from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .config import Config
import os
from datetime import datetime
import pytz

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
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

    create_database(app)
    return app

def create_database(app):
    if not os.path.exists('website/database.db'):
        with app.app_context():
            db.create_all() 
        print('Created database!')

def vn_datetime(value, fmt='%d %b %Y, %H:%M'):
    tz = pytz.timezone("Asia/Ho_Chi_Minh")

    if value.tzinfo is None:
        value = value.replace(tzinfo=pytz.UTC)

    return value.astimezone(tz)