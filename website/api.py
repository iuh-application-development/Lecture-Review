from flask import Blueprint, jsonify, request, g
from flask_login import current_user, login_required
from .models import User, Note, ShareNote, Comment, db
from datetime import datetime
from sqlalchemy.sql.expression import or_


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
        search = request.args.get('search', None, type=str)
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

        # Thêm fileter tìm kiếm
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(or_(
                Note.title.ilike(search_pattern),
                Note.content.ilike(search_pattern)
            ))
        # Sắp xếp và phân trang
        query = query.order_by(Note.updated_at.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)

        notes_data = [{
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'is_public': note.is_public,
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
    # color = data.get('color')
    user_id = data.get('user_id')
    is_public = data.get('is_public', False)

    new_note = Note(
        title=title,
        content=content,
        user_id=user_id,
        is_public=is_public
    )

    db.session.add(new_note)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Note created successfully',
        'note_id': new_note.id
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
    note.is_public = data.get('is_public', note.is_public)
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
        'is_public': note.is_public,
        'created_at': note.created_at,
        'updated_at': note.updated_at
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
        is_public = data.get('is_public', False)
        
        print ('Received share-note data: ',data) # log 

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
        
        #Kiểm tra và chuyển đổi is_public thành boolean
        if not isinstance(is_public, bool):
            print ('Invalid is_public value: ', is_public)
            return jsonify({
                'success': False,
                'message': 'Invalid is_public value'
            }), 400
        
        # Cập nhật trạng thái công khai
        note.is_public = is_public
        note.updated_at = datetime.utcnow()
        db.session.commit()

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
        
        
@api.route('/public-notes', methods=['GET'])
def get_public_notes():
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 15, type=int)
        search = request.args.get('search', None, type=str)
        
        query = Note.query.filter_by(is_public=True)
        
        if search:
           search_pattern = f'%{search}%'
           query = query.filter(or_(
               Note.title.ilike(search_pattern),
               Note.content.ilike(search_pattern)
           ))
           
        notes = query.paginate(page=page, per_page=limit, error_out=False)
        
        
        result = [{
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'user_id': note.user_id,
            # 'user_name': f'{note.user.first_name} {note.user.last_name}',
            'is_public': note.is_public,
            'updated_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for note in notes.items]
        
        return jsonify({
            'data': result,
            'total': notes.total,
            'pages': notes.pages,
            'current_page': page
        })
    except Exception as e:
        print('Error in get_public_notes:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error fetching public notes'
        }), 500

@api.route('/comments/<int:note_id>', methods=['GET'])
def get_comments(note_id):
    try: 
        note = Note.query.get_or_404(note_id)
        if not note.is_public and note.user_id != current_user.id:
            shared = ShareNote.query.filter_by(note_id=note_id, recipient_id=current_user.id).first()
            if not shared:
                return jsonify({
                    'status': 'error',
                    'message': 'You are not allowed to access this note'
                }), 403
        
        comments = Comment.query.filter_by(note_id=note_id).order_by(Comment.created_at.asc()).all()
        comments_data = [{
            'id': comment.id,
            'content': comment.content,
            'user_id': comment.user_id,
            'user_name': f'{comment.user.first_name} {comment.user.last_name}',
            'created_at': comment.created_at.isoformat() if comment.created_at else None
        } for comment in comments]
        
        return jsonify({
            'status': 'success',
            'data': comments_data
        })
    except Exception as e:
        print('Error in get_comments:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error fetching comments'
        }), 500
    
@api.route('/comments/<int:note_id>', methods=['POST'])
@login_required
def create_comment(note_id):
    try:
        note = Note.query.get_or_404(note_id)
        if not note.is_public and note.user_id != current_user.id:
            shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
            if not shared:
                return jsonify({
                    'status': 'error',
                    'message': "You don't have permission to comment on this note."
                }), 403

        data = request.get_json()
        content = data.get('content')

        if not content:
            return jsonify({
                'status': 'error',
                'message': 'Comment content cannot be empty'
            }), 400

        new_comment = Comment(
            note_id=note_id,
            user_id=current_user.id,
            content=content
        )

        db.session.add(new_comment)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Comment added successfully',
            'comment': {
                'id': new_comment.id,
                'content': new_comment.content,
                'user_id': new_comment.user_id,
                'user_name': f'{current_user.first_name} {current_user.last_name}',
                'created_at': new_comment.created_at.isoformat()
            }
        })
    except Exception as e:
        print('Error in create_comment:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error creating comment'
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