from flask import Blueprint, jsonify, request, g, make_response, render_template, flash, redirect, url_for
from flask_login import current_user, login_required
from .models import User, Note, ShareNote, Comment, UserWarning, UserNotification, db
from .utils.convert_note_to_pdf import *
from .mailer import send_email
import pyotp
from datetime import datetime
from weasyprint import HTML
from markupsafe import Markup
import html
import json
from sqlalchemy.sql.expression import or_
from werkzeug.utils import secure_filename
import os


api = Blueprint('api', __name__)
API_VERSION = 'api-v1'

@api.route('/notes', methods=['GET'])
def get_notes():
    try:
        limit = request.args.get('limit', type=int)
        is_trashed = request.args.get('is_trashed', False, type=bool)
        query = Note.query.filter_by(user_id=current_user.id, is_trashed=is_trashed).order_by(Note.updated_at.desc())

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
            'tags': note.tags,
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
        is_trashed = request.args.get('is_trashed', False, type=bool)

        search = request.args.get('search', None, type=str)
        # Tạo query base
        query = Note.query.filter_by(user_id=current_user.id, is_trashed=is_trashed)

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
            'tags': note.tags,
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
    color = data.get('color', 'note-green')
    tags = data.get('tags', [])
    user_id = data.get('user_id')
    is_public = data.get('is_public', False)

    new_note = Note(
        title=title,
        content=content,
        color=color,
        tags=tags,
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
    note.tags = data.get('tags', note.tags)
    note.is_public = data.get('is_public', note.is_public)

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
            }, 400)

        # Kiểm tra ghi chú có tồn tại không
        note = Note.query.get(note_id)
        if not note:
            return jsonify({
                'success': False,
                'message': 'Note not found'
            }, 404)

        # Kiểm tra quyền chia sẻ
        if note.user_id != current_user.id:
            return jsonify({
                'success': False,
                'message': "You don't have permission to share this note."
            }, 403)
        
        #Kiểm tra và chuyển đổi is_public thành boolean
        if not isinstance(is_public, bool):
            print ('Invalid is_public value: ', is_public)
            return jsonify({
                'success': False,
                'message': 'Invalid is_public value'
            }, 400)
        
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
            }, 404)
        
        # Kiểm tra xem ghi chú đã được chia sẻ chưa
        existinng_share = ShareNote.query.filter_by(note_id=note_id, recipient_id=recipient.id).first()
        if existinng_share:
            return jsonify({
                'success': False,
                'message': 'Note already shared with this recipient'
            }, 400)
        
        shared_note = ShareNote(
            note_id=note_id,
            sharer_id=current_user.id,
            recipient_id=recipient.id,
            shared_at=datetime.utcnow(),
            can_edit=can_edit
        )
        db.session.add(shared_note)
        db.session.commit()
        
        # Create notification for recipient
        notification = UserNotification(
            user_id=recipient.id,
            title=f"A note has been shared with you",
            message=message or f"{current_user.first_name} {current_user.last_name} shared a note with you.",
            type='info',
            link=f"/edit-note/{note_id}",
            is_read=False
        )
        db.session.add(notification)
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
    
@api.route('/notes/<int:note_id>/move-to-trash', methods=['POST'])
@login_required
def move_to_trash(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied.'}), 403

    note.is_trashed = True
    note.deleted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Note moved to trash.'})

@api.route('/notes/<int:note_id>/restore', methods=['POST'])
@login_required
def restore_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied.'}), 403

    note.is_trashed = False
    note.deleted_at = None
    db.session.commit()
    return jsonify({'success': True, 'message': 'Note restored successfully.'})

@api.route('/notes/<int:note_id>/delete', methods=['POST'])
@login_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Permission denied.'}), 403

    if (not note.is_trashed) and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Note must be moved to trash before deleting.'}), 400

    db.session.delete(note)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Note permanently deleted.'})

@api.route('/user-notes/<int:user_id>')
def get_user_notes(user_id):
    notes = Note.query.filter_by(user_id=user_id).all()
    notes_data = [{
        'id': note.id,
        'title': note.title,
        'created_at': note.created_at,
        'updated_at': note.updated_at,
        'tags': note.tags
    } for note in notes]

    return jsonify({'success': True, 'notes': notes_data})

@api.route('/shared-notes', methods=['GET'])
def get_shared_notes():
    try:
        limit = request.args.get('limit', type=int)
        by_me = request.args.get('byMe', type=int)

        if by_me:
            query = ShareNote.query.join(ShareNote.note).filter(ShareNote.sharer_id==current_user.id, Note.is_trashed==False).order_by(Note.updated_at.desc())
        else:
            query = ShareNote.query.join(ShareNote.note).filter(ShareNote.recipient_id==current_user.id, Note.is_trashed==False).order_by(Note.updated_at.desc())

        if limit:
            shared_notes = query.limit(limit).all()
        else:
            shared_notes = query.all()

        shared_notes_data = [{
            'note_id': shared_note.note.id,
            'title': shared_note.note.title,
            'message': shared_note.message,
            'updated_at': str(shared_note.note.updated_at),
            'share_at': str(shared_note.shared_at),
            'color': shared_note.note.color,
            'tags': shared_note.note.tags,
            'sharer': shared_note.sharer.first_name + ' ' + shared_note.sharer.last_name,
            'recipient': shared_note.recipient.first_name + ' ' + shared_note.recipient.last_name
        } for shared_note in shared_notes]

        return jsonify({
            'status': 'success',
            'data': shared_notes_data
        })

    except Exception as e:
        print('Error in get_notes:', str(e))  # Log lỗi để debug
        return jsonify({
            'status': 'error',
            'message': 'Error fetching notes'
        }), 500

@api.route('/export-pdf', methods=['POST'])
def export_pdf():
    payload = request.get_json()
    blocks = payload.get('blocks', [])
    title = payload.get('title', '')
    content_html = f'<h1 style="text-align:center">{html.escape(str(title).strip())}</h1>\n'
    content_html += blocks_to_html(blocks)

    rendered = render_template(
        'pdf_template.html',
        content=Markup(content_html),
        mathjax=False
    )

    # Chuyển sang PDF
    pdf = HTML(string=rendered).write_pdf(stylesheets=[])

    # Trả về PDF
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=note.pdf'
    return response

@api.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')

    totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
    otp = totp.now()

    message = f"""
    <html>
    <body>
        <p>Mã OTP của bạn là: <strong>{otp}</strong><br>Có hiệu lực trong 5 phút.</p>
    </body>
    </html>
    """

    send_email('Mã OTP của bạn', email, message)
    return message
        
        
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
        
        valid_colors = ['note-yellow', 'note-green', 'note-purple', 'note-blue']
        result = [{
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color':note.color if note.color in valid_colors else 'note-yellow',
            'user_id': note.user_id,
            'tags': note.tags,
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
            if not shared and current_user.role != 'admin':
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
 
@api.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    try:
        # Limit mặc định là 5 để phù hợp với frontend
        limit = request.args.get('limit', 5, type=int)

        # Truy vấn thông báo, ưu tiên thông báo chưa đọc
        query = UserNotification.query.filter_by(user_id=current_user.id)
        query = query.order_by(
            UserNotification.created_at.desc()
        )

        # Giới hạn số lượng thông báo
        notifications = query.limit(limit).all()

        # Chuyển đổi thông báo sang định dạng JSON
        notifications_data = [{
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'link': notification.link,
            'created_at': notification.created_at.isoformat(),
            'is_read': notification.is_read
        } for notification in notifications]

        # Đếm số thông báo chưa đọc
        unread_count = UserNotification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).count()

        return jsonify({
            'status': 'success',
            'data': {
                'notifications': notifications_data,
                'unread_count': unread_count
            }
        })
    except Exception as e:
        # In ra lỗi để debug
        print(f'Error getting notifications: {str(e)}')
        return jsonify({
            'status': 'error',
            'message': 'Error fetching notifications'
        }), 500
        
@api.route('/notifications/mark-read/<int:notification_id>', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    try:
        notification = UserNotification.query.get_or_404(notification_id)

        if notification.user_id != current_user.id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403

        notification.is_read = True
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Notification marked as read'
        })
    except Exception as e:
        print('Error marking notification as read:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error updating notification'
        }), 500

@api.route('/notifications/mark-all-read', methods=['POST'])
@login_required
def mark_all_notifications_read():
    try:
        unread_notifications = UserNotification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).all()

        for notification in unread_notifications:
            notification.is_read = True

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'All notifications marked as read',
            'count': len(unread_notifications)
        })
    except Exception as e:
        print('Error marking all notifications as read:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Error updating notifications'
        }), 500

@api.route('/update-avatar', methods=['POST'])
@login_required
def update_avatar():
    if 'avatar' not in request.files:
        flash('No image file found.', 'error')
        return redirect(url_for('views.profile'))

    file = request.files['avatar']
    if file.filename == '':
        flash('You have not selected an image.', 'error')
        return redirect(url_for('views.profile'))

    filename = secure_filename(file.filename)

    upload_folder = os.path.join('website', 'static', 'images', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    upload_path = os.path.join(upload_folder, filename)
    file.save(upload_path)

    current_user.avatar_url = f'images/uploads/{filename}'
    db.session.commit()

    flash('Avatar updated successfully!', 'success')
    return redirect(url_for('views.profile'))

@api.route('/notes/<int:note_id>/clone', methods=['POST'])
@login_required
def clone_note(note_id):
    try:
        note_to_clone = Note.query.get(note_id)
        
        is_public = note_to_clone.is_public
        is_shared = ShareNote.query.filter_by(note_id=note_id, recipient_id=current_user.id).first() is not None
        is_owner = note_to_clone.user_id == current_user.id
        
        if not (is_public or is_shared or is_owner):
            return jsonify({
                'success': False,
                'message': 'You do not have permission to clone this note'
            }), 403
        
        cloned_note = Note(
            title=f"Copy of {note_to_clone.title}",
            content=note_to_clone.content,
            color=note_to_clone.color,
            tags=note_to_clone.tags,
            user_id=current_user.id
        )
        
        db.session.add(cloned_note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note cloned successfully',
            'note_id': cloned_note.id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cloning note: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error cloning note: {str(e)}'
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

