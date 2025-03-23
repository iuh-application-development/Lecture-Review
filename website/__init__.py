from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from .config import Config
import os
from os import path

db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SECRET_KEY'] = 'your-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)
    
    from .views import views
    from .api import api
    
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(api, url_prefix='/api')

    create_database(app)

    return app

def create_database(app):
    if not path.exists('website/' + DB_NAME):
        with app.app_context():
            db.create_all() 
        print('Created database!')