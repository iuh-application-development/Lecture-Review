from flask import Blueprint, render_template, flash, redirect, url_for, jsonify, request
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

@views.route('/create-note')
@login_required
def create_note():
    return render_template('note_view.html', user=current_user, current_time=datetime.utcnow())

@views.route('/edit-note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
    
    if note.user_id != current_user.id and ( not shared or not shared.can_edit):
        flash('You do not have permission to edit this note.', 'error')
        return redirect(url_for('views.all_my_notes'))

    return render_template('note_view.html', user=current_user, note=note, shared=shared)