from flask import Blueprint, render_template, flash, redirect, url_for
from flask_login import current_user, login_required
from .models import Note, ShareNote, User
from datetime import datetime
from . import db

views = Blueprint('views', __name__)

@views.route('/')
def home():
    return render_template('home.html', user=current_user)

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@views.route('/all-my-notes')
@login_required
def all_my_notes():
    return render_template('all_my_notes.html', user=current_user)

@views.route('/share-with-me')
@login_required
def share_with_me():
    return render_template('share_with_me.html', user=current_user, share_by_me=0)

@views.route('/share-by-me')
@login_required
def share_by_me():
    return render_template('share_with_me.html', user=current_user, shared_by_me=1)

@views.route('/trash')
@login_required
def trash():
    return render_template('trash.html', user=current_user)

@views.route ('/public-notes')
@login_required
def public_notes():
    return render_template('public_notes.html', user=current_user)

@views.route('/create-note')
@login_required
def create_note():
    return render_template('note_view.html', user=current_user, current_time=datetime.utcnow())

@views.route('/edit-note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):

    note = Note.query.get_or_404(note_id)
    
    if note.user_id == current_user.id:
        view_only = False
        shared = None
    else:
        shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
        if shared:
            view_only = not shared.can_edit
        elif note.is_public:
            view_only = True
            shared = None
        else:
            flash ("You don't have permission to view this note.", 'error')
            return redirect(url_for('views.all_my_notes'))

    sharer = None
    if shared and shared.sharer_id:
        sharer = User.query.get(shared.sharer_id) 
        
    return render_template(
        'note_view.html',
        note=note,
        shared=shared,
        sharer=sharer,
        view_only=view_only,
        current_time = datetime.utcnow(),
        user = current_user
    )

@views.route('/notifications')
@login_required
def notifications():
    return render_template('notifications.html', user=current_user)