from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import current_user, login_required
from .models import Note, ShareNote

views = Blueprint('views', __name__)

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

@views.route('/note_detail/<int:note_id>')
@login_required
def note_detail(note_id):
    try:
        note = Note.query.get_or_404(note_id)
        shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
        print(f"Accessing note {note_id}: user_id={current_user.id}, note_owner={note.user_id}, shared={shared}")
        if note.user_id != current_user.id and not shared:
            flash('You do not have permission to view this note.', 'error')
            return redirect(url_for('views.share_with_me'))
        sharer = shared.sharer if shared else None
        return render_template('note_detail.html', user=current_user, note=note, shared=shared, sharer=sharer, editing=False)
    except Exception as e:
        print(f"Error loading note {note_id}: {str(e)}")
        flash('Error loading note.', 'error')
        return redirect(url_for('views.share_with_me'))

@views.route('/edit_note/<int:note_id>', methods=['GET'])
@login_required
def edit_note(note_id):
    try:
        note = Note.query.get_or_404(note_id)
        shared = ShareNote.query.filter_by(note_id=note.id, recipient_id=current_user.id).first()
        print(f"Editing note {note_id}: user_id={current_user.id}, note_owner={note.user_id}, shared={shared}")
        if note.user_id != current_user.id and ( not shared or not shared.can_edit):
            flash('You do not have permission to edit this note.', 'error')
            return redirect(url_for('views.note_detail', note_id=note_id))
        return render_template('note_detail.html', user=current_user, note=note, shared=shared, sharer=shared.sharer if shared else None, editing=True)
    except Exception as e:
        print(f"Error loading note for edit {note_id}: {str(e)}")
        flash('Error loading note.', 'error')
        return redirect(url_for('views.all_my_notes'))