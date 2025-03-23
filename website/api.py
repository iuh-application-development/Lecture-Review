from flask import Blueprint, jsonify, request, g
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