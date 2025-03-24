from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user

admin = Blueprint('admin', __name__)

@admin.route('/')
def dashboard():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/dashboard_admin.html')