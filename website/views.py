from flask import Blueprint, render_template, flash, redirect
from flask_login import current_user, login_required
from .models import Note, ShareNote

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
    shared_notes = ShareNote.query.filter_by(recipient_id=current_user.id).all()
    return render_template('share_with_me.html', user=current_user, shared_notes=shared_notes, share_by_me=False)

@views.route('/share-by-me')
@login_required
def share_by_me():
    shared_notes = ShareNote.query.filter_by(sharer_id=current_user.id).all()
    return render_template('share_with_me.html', user=current_user, shared_notes=shared_notes, shared_by_me=True)

@views.route('/trash')
@login_required
def trash():
    return render_template('trash.html', user=current_user)

@views.route('/create-note')
@login_required
def create_note():
    return render_template('note_view.html', user=current_user)

@views.route('/edit-note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)

    if note.user_id != current_user.id:
        return redirect('views.all_my_notes')

    return render_template('note_view.html', user=current_user, note=note)