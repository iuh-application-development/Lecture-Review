from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    create_database(app)

    return app

def create_database(app):
    if not os.path.exists('website/database.db'):
        with app.app_context():
            db.create_all() 
        print('Created database!')