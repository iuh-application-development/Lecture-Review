from flask import Blueprint, jsonify, request, g, current_app, url_for
from werkzeug.security import generate_password_hash
from flask_login import current_user
from .models import User, Note, db
from datetime import datetime

api = Blueprint('api', __name__)
API_VERSION = 'api-v1'

@api.route('/users', methods=['GET'])
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
    return api_response(users_data)

@api.route('/users/<int:user_id>', methods=['GET'])
def get_user_detail(user_id):
    user = User.query.get_or_404(user_id)
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at
    }
    return api_response(user_data)

@api.route('/notes', methods=['GET'])
def get_notes():
    limit = request.args.get('limit', type=int)
    
    if current_user.role == 'admin':
        all_param = request.args.get('all', 'false').lower()
        if all_param == 'true':
            query = Note.query.order_by(Note.updated_at.desc())
        else:
            query = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc())
    else:
        query = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc())

    if limit is not None and limit > 0:
        notes = query.limit(limit).all()
    else:
        notes = query.all()

    notes_data = [
        {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'user_id': note.user_id,
            'updated_at': note.updated_at
        }
        for note in notes
    ]
    return api_response(notes_data)

@api.route('/notes/create', methods=['POST'])
def create_note():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    color = data.get('color')
    user_id = data.get('user_id')

    new_note = Note(
        title=title,
        content=content,
        color=color,
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(new_note)
    db.session.commit()

    return jsonify({
        'success': True,
        'redirect': url_for('views.dashboard')
    })

@api.route('/notes/edit/<int:note_id>', methods=['POST'])
def edit_note(note_id):
    return ''

@api.route('/notes/<int:note_id>', methods=['GET'])
def get_note_detail(note_id):
    note = Note.query.get_or_404(note_id)
    note_data = {
        'id': note.id,
        'title': note.title,
        'content': note.content,
        'user_id': note.user_id,
        'created_at': note.created_at
    }
    return api_response(note_data)

# /api/register-admin/your_secret_key?email=admin@gmail.com&password=admin123
@api.route('/register-admin/<string:secret_key>', methods=['GET'])
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

    return api_response({'message': 'Admin account created successfully', 'email': email})

### Standardize API responses and Handle Error ###
@api.before_request
def before_api_request():
    g.api_info = {
        'version': API_VERSION,
        'endpoint': request.path,
        'method': request.method
    }

def api_response(data):
    return jsonify({
        'api_info': g.api_info,
        'data': data
    })

@api.errorhandler(404)
def handle_404_error(e):
    return jsonify({
        'api_info': g.get('api_info', {}),
        'error': 'Resource not found',
        'details': f'The requested resource at {request.path} was not found.',
        'status': 404
    }), 404