from flask import Blueprint, jsonify, request, g
from flask_login import current_user, login_required
from .models import User, Note, ShareNote,db
from datetime import datetime


api = Blueprint('api', __name__)
API_VERSION = 'api-v1'

@api.route('/notes', methods=['GET'])
def get_notes():
    try:
        limit = request.args.get('limit', type=int)
        query = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc())


        if limit:
            notes = query.limit(limit).all()
        else:
            notes = query.all()

        notes_data = [{
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'user_id': note.user_id,
            'updated_at': note.updated_at.isoformat() if note.updated_at else None
        } for note in notes]

        return jsonify({
            'status': 'success',
            'data': notes_data
        })

    except Exception as e:
        print('Error in get_notes:', str(e))  # Log lỗi để debug
        return jsonify({
            'status': 'error',
            'message': 'Error fetching notes'
        }), 500

@api.route('/notes-paginate', methods=['GET'])
def get_notes_paginate():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 15, type=int)
        color = request.args.get('color', '')
        date_filter = request.args.get('date', '', type=str)

        # Tạo query base
        query = Note.query.filter_by(user_id=current_user.id)

        # Thêm filter màu sắc
        if color:
            query = query.filter_by(color=color)

        # Thêm filter ngày
        if date_filter:
            days = int(date_filter)
            from datetime import datetime, timedelta
            date_limit = datetime.utcnow() - timedelta(days=days)
            query = query.filter(Note.created_at >= date_limit)

        # Sắp xếp và phân trang
        query = query.order_by(Note.updated_at.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)

        notes_data = [{
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'updated_at': note.updated_at.isoformat() if note.updated_at else None
        } for note in pagination.items]

        return jsonify({
            'status': 'success',
            'data': {
                'notes': notes_data,
                'page': pagination.page,
                'total_pages': pagination.pages,
                'total_items': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })

    except Exception as e:
        print('Error in get_notes_paginate:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error fetching notes'
        }), 500

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
        'message': 'Note created successfully'
    })

@api.route('/notes/edit/<int:note_id>', methods=['POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
    if note.user_id != current_user.id and (not shared or not shared.can_edit):
        return jsonify({
            'status': 'error',
            'message': "You don't have permission to edit this note."
        }), 403

    data = request.get_json() or {}

    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)
    note.color = data.get('color', note.color)
    note.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Note updated successfully!'
    })

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

@api.route('/share-note', methods=['POST'])
@login_required
def share_note():
    try:
        data = request.get_json()
        note_id = data.get('note_id')
        recipient_email = data.get('recipient_email')
        message = data.get('message')
        can_edit = data.get('can_edit', True)

        if not note_id or not recipient_email:
            return jsonify({
                'success': False,
                'message': 'Missing note ID or recipient email'
            }), 400

        # Kiểm tra ghi chú có tồn tại không
        note = Note.query.get(note_id)
        if not note:
            return jsonify({
                'success': False,
                'message': 'Note not found'
            }), 404

        # Kiểm tra quyền chia sẻ
        if note.user_id != current_user.id:
            return jsonify({
                'success': False,
                'message': "You don't have permission to share this note."
            }), 403

        # Kiểm tra người nhận có tồn tại không
        recipient = User.query.filter_by(email=recipient_email).first()
        if not recipient:
            return jsonify({
                'success': False,
                'message': 'Recipient not found'
            }), 404
        
        # Kiểm tra xem ghi chú đã được chia sẻ chưa
        existinng_share = ShareNote.query.filter_by(note_id=note_id, recipient_id=recipient.id).first()
        if existinng_share:
            return jsonify({
                'success': False,
                'message': 'Note already shared with this recipient'
            }), 400
        
        shared_note = ShareNote(
            note_id=note_id,
            sharer_id=current_user.id,
            recipient_id=recipient.id,
            shared_at=datetime.utcnow(),
            message=message,
            can_edit=can_edit
        )
        db.session.add(shared_note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note shared successfully'
        })
    except Exception as e:
        print('Error in share_note:', str(e))
        return jsonify({
            'success': False,
            'message': 'Error sharing note'
        }), 500

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