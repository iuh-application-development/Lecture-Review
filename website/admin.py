from flask import Blueprint, render_template, redirect, url_for, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from flask_login import current_user
from .models import User, Note, db

admin = Blueprint('admin', __name__)

@admin.route('/')
def dashboard():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    total_users = User.query.count()
    total_notes = Note.query.count()

    return render_template('admin/dashboard_admin.html', total_users=total_users, total_notes=total_notes)

@admin.route('/manage-users')
def manage_users():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/manage_users.html')

@admin.route('/manage-contents')
def manage_contents():
    if not (current_user.is_authenticated and current_user.role == 'admin'):
        return redirect(url_for('views.home'))
    
    return render_template('admin/manage_contents.html')

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
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status', 'all', type=int)
    search = request.args.get('search', '')

    query = User.query
    if status != 'all':
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
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status', 'all')
    search = request.args.get('search', '')

    query = Note.query
    if status != 'all':
        query = query.filter_by(color=status)  # Giả sử `color` đại diện cho trạng thái
    if search:
        query = query.filter(Note.title.ilike(f'%{search}%'))

    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    contents = pagination.items

    contents_data = [
        {
            'id': content.id,
            'title': content.title,
            'author': f'{content.user.first_name} {content.user.last_name}',
            'created_at': content.created_at.strftime('%Y-%m-%d'),
            'status': 'published' if content.color == 'note-green' else 'privated'
        }
        for content in contents
    ]

    return jsonify({
        'contents': contents_data,
        'total': pagination.total
    })

@admin.route('/users/<int:user_id>/toggle-lock', methods=['POST'])
def toggle_user_lock(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    new_status = data.get('status')

    user.status = new_status
    db.session.commit()

    return jsonify({'success': True, 'message': 'User status updated successfully'})

@admin.route('/user_detail/<int:user_id>')
def user_detail(user_id):
    user = User.query.get_or_404(user_id)
    # Dummy data for notes
    dummy_notes = [
        {'id': 1, 'title': 'Note 1', 'content': 'Content 1', 'created_at': '2024-01-01'},
        {'id': 2, 'title': 'Note 2', 'content': 'Content 2', 'created_at': '2024-01-02'},
        {'id': 3, 'title': 'Note 3', 'content': 'Content 3', 'created_at': '2024-01-03'}
    ]
    return render_template('admin/user_detail.html', user=current_user, target_user=user)