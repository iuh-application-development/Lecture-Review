from flask import Blueprint, jsonify, request, g, current_app
from werkzeug.security import generate_password_hash
from .models import User, Note, db

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
    notes = Note.query.all()
    notes_data = [
        {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'user_id': note.user_id,
            'created_at': note.created_at
        }
        for note in notes
    ]
    return api_response(notes_data)

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