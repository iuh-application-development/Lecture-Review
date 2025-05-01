from . import db
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    first_name    = db.Column(db.String(150), nullable=False)
    last_name     = db.Column(db.String(150), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    role          = db.Column(db.String(10), nullable=False, default='user')  # 'user' hoặc 'admin'
    status        = db.Column(db.String(20), default='active') # ['Active', 'Locked', 'Inactive']
    gender        = db.Column(db.String(10), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.email!r}>'
    
class Note(db.Model):
    __tablename__ = 'notes'
    id            = db.Column(db.Integer, primary_key=True)
    title         = db.Column(db.String(200), nullable=False)
    content       = db.Column(db.JSON)
    color         = db.Column(db.String(20), default='note-green')
    tags          = db.Column(db.JSON, default=list)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_trashed    = db.Column(db.Boolean, default=False)
    deleted_at    = db.Column(db.DateTime, nullable=True)
    is_public     = db.Column(db.Boolean, default=False)
    disable        = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref=db.backref('notes', lazy=True))
    
    def __repr__(self):
        return f'<Note {self.title!r} by Author#{self.user_id}>'
    

class ShareNote(db.Model):
    __tablename__ = 'share_notes'
    id            = db.Column(db.Integer, primary_key=True)
    note_id       = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    sharer_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id  = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shared_at     = db.Column(db.DateTime, default=datetime.utcnow)
    can_edit      = db.Column(db.Boolean, default=False)
    message       = db.Column(db.String(200), nullable=True)
    
    note          = db.relationship('Note', backref=db.backref('shared_notes', lazy=True, cascade='all, delete'))
    sharer        = db.relationship('User', foreign_keys=[sharer_id], backref=db.backref('shared_notes_sent', lazy=True))
    recipient     = db.relationship('User', foreign_keys=[recipient_id], backref=db.backref('shared_notes_received', lazy=True))
    
    def __repr__(self):
        return f'<ShareNote note#{self.note_id} from User#{self.sharer_id} to User#{self.recipient_id}>'

class Comment (db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    note_id       = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content       = db.Column(db.Text, nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    
    note          = db.relationship('Note', backref=db.backref('comments', lazy=True))
    user          = db.relationship('User', backref=db.backref('comments', lazy=True))

    def __repr__(self):
        return f'<Comment on Note {self.note_id} by User#{self.user_id}>'

class UserWarning(db.Model):
    __tablename__ = 'user_warnings'
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    note_id       = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=True)
    admin_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason        = db.Column(db.String(50), nullable=False)  # 'inappropriate', 'copyright', 'spam', 'other'
    message       = db.Column(db.Text, nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    is_read       = db.Column(db.Boolean, default=False)

    user          = db.relationship('User', foreign_keys=[user_id], backref=db.backref('warnings_received', lazy=True))
    admin         = db.relationship('User', foreign_keys=[admin_id], backref=db.backref('warnings_given', lazy=True))
    note          = db.relationship('Note', backref=db.backref('warnings', lazy=True))

    def __repr__(self):
        return f'<UserWarning user#{self.user_id} note#{self.note_id} by admin#{self.admin_id}>'
    
class UserNotification(db.Model):
    __tablename__ = 'user_notifications'
    __table_args__ = (
        db.Index('idx_user_notifications_user_id_is_read', 'user_id', 'is_read'),
    )
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title         = db.Column(db.String(100), nullable=False)
    message       = db.Column(db.Text, nullable=False)
    type          = db.Column(db.String(20), default='info')  # 'info', 'warning', 'success', 'error'
    link          = db.Column(db.String(200), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    is_read       = db.Column(db.Boolean, default=False)

    user          = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def __repr__(self):
        return f'<UserNotification id#{self.id} user_id#{self.user_id} type#{self.type}>'