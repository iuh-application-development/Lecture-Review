from . import db
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(150), nullable=False)
    last_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(10), nullable=False, default='user')  # 'user' hoặc 'admin'
    status = db.Column(db.String(20), default='Active') # ['Active', 'Locked', 'Inactive']
    gender = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'
    
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    color = db.Column(db.String(20), default='note-green')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('notes', lazy=True))

    def __repr__(self):

        return f'<Note {self.title} by Author {self.user_id}>'
    

class ShareNote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=False)
    sharer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_at = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.relationship('Note', backref=db.backref('shared_notes', lazy=True))
    sharer = db.relationship('User', foreign_keys=[sharer_id], backref=db.backref('shared_note', lazy=True))
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref=db.backref('shared_with', lazy=True))
    can_edit = db.Column(db.Boolean, default=False)
    message = db.Column(db.String(200), nullable=True)
    def __repr__(self):
        return f'<ShareNote {self.note_id} by User {self.user_id}>'

