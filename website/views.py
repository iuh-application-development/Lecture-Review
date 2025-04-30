from flask import Blueprint, render_template, request, flash, redirect, url_for, g, current_app, session
from flask_login import login_required, current_user
from .models import Note, ShareNote, User, UserNotification, db
from datetime import datetime, timedelta
import json

views = Blueprint('views', __name__)


@views.before_request
def before_request():
    g.user = current_user


@views.route('/')
def home():
    return render_template('home.html', user=current_user)


@views.route('/dashboard')
@login_required
def dashboard():
    shared_notes = ShareNote.query.filter_by(recipient_id=current_user.id).all()
    return render_template('dashboard.html', user=current_user, shared_notes=shared_notes)


@views.route('/all-my-notes')
@login_required
def all_my_notes():
    return render_template('all_my_notes.html', user=current_user)


@views.route('/share-with-me')
@login_required
def share_with_me():
    shared_notes = ShareNote.query.filter_by(recipient_id=current_user.id).all()
    return render_template('share_with_me.html', user=current_user, shared_notes=shared_notes, shared_by_me=False)


@views.route('/share-by-me')
@login_required
def share_by_me():
    shared_notes = ShareNote.query.filter_by(sharer_id=current_user.id).all()
    return render_template('share_with_me.html', user=current_user, shared_notes=shared_notes, shared_by_me=True)


@views.route('/create-note')
@login_required
def create_note_view():
    current_time = datetime.utcnow()
    return render_template('note_view.html', user=current_user, note=None, current_time=current_time, shared=False)


@views.route('/edit-note/<int:note_id>')
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    shared = False
    sharer = None

    # Kiểm tra quyền truy cập
    if note.user_id != current_user.id:
        shared_note = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
        if not shared_note:
            flash('Bạn không có quyền truy cập ghi chú này', 'danger')
            return redirect(url_for('views.dashboard'))
        shared = True
        sharer = shared_note.sharer

    current_time = datetime.utcnow()
    return render_template('note_view.html', user=current_user, note=note, current_time=current_time, shared=shared,
                           sharer=sharer)


@views.route('/trash')
@login_required
def trash():
    return render_template('trash.html', user=current_user)


# Thêm route cho trang thông báo
@views.route('/notifications')
@login_required
def notifications():
    return render_template('notifications.html', user=current_user)


# Route để đánh dấu tất cả thông báo đã đọc
@views.route('/mark-all-notifications-read', methods=['POST'])
@login_required
def mark_all_notifications_read():
    unread_notifications = UserNotification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).all()

    for notification in unread_notifications:
        notification.is_read = True

    db.session.commit()

    flash('All notifications marked as read', 'success')
    return redirect(url_for('views.notifications'))