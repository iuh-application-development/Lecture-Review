from flask import Blueprint, render_template, redirect, url_for, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from flask_login import current_user
from .models import User, Note, db

admin = Blueprint('admin', __name__)

@admin.route('/')
def dashboard():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/dashboard_admin.html')

# /admin/register-admin/your_secret_key?email=admin@gmail.com&password=admin123
@admin.route('/register-admin/<string:secret_key>', methods=['GET'])
def register_admin(secret_key):
    if current_app.secret_key != secret_key:
        return jsonify({'error': 'Invalid secret key'}), 403

    email = request.args.get('email')
    password = request.args.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'error': 'User with this email already exists'}), 400
    
    new_user = User(
        email=email,
        password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
        first_name='admin',
        last_name=email,
        gender='Male',
        role='admin'
    )
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('admin.dashboard'))

@admin.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
        for user in users
    ]
    return jsonify(users_data)

@admin.route('/users/<int:user_id>', methods=['GET'])
def get_user_detail(user_id):
    user = User.query.get_or_404(user_id)
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at
    }
    return jsonify(user_data)