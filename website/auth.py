from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, current_user, login_required
from .models import User, db
from .utils.jwt_processor import verify_password_reset_token

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('views.home'))

    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            if user.status == 'Locked':
                return jsonify({'success': False, 'message': 'Tài khoản của bạn đã bị khóa.'})
            if check_password_hash(user.password_hash, password):
                login_user(user)
                return jsonify({'success': True, 'redirect': url_for('views.dashboard')})
            else:
                return jsonify({'success': False, 'message': 'Incorrect password, try again.'})
        else:
            return jsonify({'success': False, 'message': 'Email does not exists.'})

    return render_template('login.html')

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        gender = data.get('gender')

        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify({'success': False, 'message': 'Email already exists.'})
    
        new_user = User(
            email=email,
            password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
            first_name=first_name,
            last_name=last_name,
            gender=gender
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({'success': True, 'redirect': url_for('views.dashboard')})

    return render_template('register.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('views.home'))

@auth.route('/change-password', methods=['POST'])
@login_required
def change_password():
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')

    if not check_password_hash(current_user.password_hash, current_password):
        flash('Incorrect current password.', 'danger')
        return redirect(url_for('views.profile'))

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    flash('Password changed successfully!', 'success')
    return redirect(url_for('views.profile'))

@auth.route('/forgot-password')
def forgot_password():
    if current_user.is_authenticated:
        return redirect(url_for('views.home'))
    return render_template('forgot-password.html')

@auth.route('/reset-password')
def reset_password():
    if current_user.is_authenticated:
        return redirect(url_for('views.home'))
        
    token = request.args.get('token')
    if not token:
        flash('Liên kết không hợp lệ. Vui lòng thử lại.', 'error')
        return redirect(url_for('auth.login'))
        
    # Kiểm tra token có hợp lệ không 
    email = verify_password_reset_token(token)
    if not email:
        flash('Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.', 'error')
        return redirect(url_for('auth.forgot_password'))
        
    return render_template('reset-password.html', token=token, email=email)