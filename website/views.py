from flask import Blueprint, render_template
from flask_login import current_user, login_required

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template('home.html', user=current_user)

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@views.route('/all-my-notes')
@login_required
def all_my_notes():
    return render_template('all_my_notes.html', user=current_user)

@views.route('/share-with-me')
@login_required
def share_with_me():
    return render_template('share_with_me.html', user=current_user)

@views.route('/trash')
@login_required
def trash():
    return render_template('trash.html', user=current_user)
