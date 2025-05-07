from flask import Blueprint, render_template, redirect, url_for, request, jsonify, current_app, flash
from werkzeug.security import generate_password_hash
from flask_login import current_user
from .models import User, Note, UserWarning, UserNotification, db
import datetime
import traceback

admin = Blueprint('admin', __name__)

@admin.route('/')
def dashboard():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    total_users = User.query.count()
    total_notes = Note.query.count()

    return render_template('admin/dashboard_admin.html', total_users=total_users, total_notes=total_notes, user=current_user)

@admin.route('/manage-users')
def manage_users():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/manage_users.html', user=current_user)

@admin.route('/manage-contents')
def manage_contents():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/manage_contents.html', user=current_user)

# /admin/register-admin/your_secret_key?email=admin@gmail.com&password=admin123
@admin.route('/register-admin/<string:secret_key>', methods=['POST'])
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
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return jsonify({
                    'status': 'error',
                    'message': "You don't have permission."
                }), 403
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status', 'All', type=str)
    search = request.args.get('search', '')

    query = User.query
    if status != 'All':
        query = query.filter_by(status=status)
    if search:
        query = query.filter(User.email.ilike(f'%{search}%'))
    
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    users = pagination.items

    users_data = [
        {
            'id': user.id,
            'email': user.email,
            'status': user.status,
            'last_login': user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else None
        }
        for user in users
    ]
    return jsonify({
        'users': users_data,
        'total': pagination.total
    })

@admin.route('/contents', methods=['GET'])
def get_contents():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return jsonify({
                    'status': 'error',
                    'message': "You don't have permission."
                }), 403
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    disable = request.args.get('disable', 'all')
    search = request.args.get('search', '')

    query = Note.query
    if disable != 'all':
        query = query.filter_by(disable=disable == "true")
    if search:
        query = query.filter(Note.title.ilike(f'%{search}%'))

    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    contents = pagination.items

    contents_data = [
        {
            'id': content.id,
            'title': content.title if content.title else "Untitled",
            'author': f'{content.user.first_name} {content.user.last_name}',
            'created_at': content.created_at.strftime('%Y-%m-%d'),
            'disable': content.disable
        }
        for content in contents
    ]

    return jsonify({
        'contents': contents_data,
        'total': pagination.total
    })

@admin.route('/users/<int:user_id>/toggle-lock', methods=['POST'])
def toggle_user_lock(user_id):
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return jsonify({
                    'status': 'error',
                    'message': "You don't have permission."
                }), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    new_status = data.get('status')

    user.status = new_status
    db.session.commit()

    return jsonify({'success': True, 'message': 'User status updated successfully'})

@admin.route('/user_detail/<int:user_id>')
def user_detail(user_id):
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    user = User.query.get_or_404(user_id)

    return render_template('admin/user_detail.html', user=current_user, target_user=user)

@admin.route('/view-note/<int:note_id>')
def view_note(note_id):
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    note = Note.query.get_or_404(note_id)
    return render_template('admin/admin_note_view.html', note=note, user=current_user)

@admin.route('/send-warning-form', methods=['POST'])
def send_warning_form():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    try:
        note_id = request.form.get('note_id')
        user_id = request.form.get('user_id')
        reason = request.form.get('reason')
        message = request.form.get('message')
        disable_content = request.form.get('disable_content') == 'true'

        if not user_id or not note_id or not message:
            flash('Missing required fields', 'danger')
            return redirect(url_for('admin.view_note', note_id=note_id))
        
        user = User.query.get(user_id)
        note = Note.query.get(note_id)

        if not user or not note:
            flash('User or Note not found', 'danger')
            return redirect(url_for('admin.view_note', note_id=note_id))
        
        new_warning = UserWarning(
            user_id=user_id,
            note_id=note_id,
            reason=reason,
            message=message,
            admin_id=current_user.id
        )

        db.session.add(new_warning)

        try:
            user_notification = UserNotification(
                user_id=user_id,
                title='Cảnh báo từ quản trị viên',
                message=message,
                type='warning',
                link=f'/edit-note/{note_id}' if note_id else None,
                is_read=False
            )
            db.session.add(user_notification)
            print(f'Created notification for User#{user_id}')
        except Exception as e:
            print(f'Error creating notification: {str(e)}')

        if disable_content:
            note.disable = True
            print(f'Changed note#{note_id} disable to True')
        
        db.session.commit()
        print(f'Warning created with id#{new_warning.id}')

        flash('Waring sent successfully!', 'success')
        return redirect(url_for('admin.view_note', note_id=note_id))

    except Exception as e:
        error_traceback = traceback.format_exc()
        print('Error sending warning', str(e))
        print('Traceback:', error_traceback)
        db.session.rollback()

        flash(f'Error sending warning: {str(e)}', 'danger')
        return redirect(url_for('admin.view_note', note_id=note_id))