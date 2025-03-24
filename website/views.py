from flask import Blueprint, render_template
from flask_login import current_user

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template('home.html', user=current_user)

@views.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', user=current_user)

@views.route('/share-with-me')
def share_with_me():
    return render_template('share_with_me.html', user=current_user)

@views.route('/trash')
def trash():
    return render_template('trash.html', user=current_user)
