from flask import Blueprint, render_template
from flask_login import current_user

admin = Blueprint('admin', __name__, template_folder='templates', static_folder='static')

@admin.route('/')
def dashboard():
    return render_template('dashboard_admin.html', user=current_user)