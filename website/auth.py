from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, current_user, login_required
from .models import User, db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    return ''

@auth.route('register', methods=['GET', 'POST'])
def register():
    return ''

@auth.route('/logout')
@login_required
def logout():
    login_user()
    return redirect(url_for('views.home'))