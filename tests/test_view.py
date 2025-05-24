import pytest
from flask import url_for
from website.models import Note, ShareNote
from datetime import datetime

def login(client):
    """Helper function để đăng nhập người dùng test."""
    return client.post('/login', json={
        'email': 'testuser@example.com',
        'password': 'testpassword'
    })

def test_home_access(client):
    """Trang chủ không cần đăng nhập."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'home' in response.data.lower()

def test_dashboard_requires_login(client):
    """Dashboard yêu cầu đăng nhập."""
    response = client.get('/dashboard')
    assert response.status_code == 302  # redirect to login
    assert '/login' in response.headers['Location']

def test_dashboard_after_login(client):
    login(client)
    response = client.get('/dashboard')
    assert response.status_code == 200
    assert b'dashboard' in response.data.lower()

def test_all_my_notes(client):
    login(client)
    response = client.get('/all-my-notes')
    assert response.status_code == 200
    assert b'all my notes' in response.data.lower()

def test_share_with_me(client):
    login(client)
    response = client.get('/share-with-me')
    assert response.status_code == 200
    assert b'Shared with me' in response.data
    assert b'<a class="tab-button active"' in response.data
    assert b'<a class="tab-button active" href="/share-by-me">' not in response.data
    assert b'data-by-me="false"' in response.data

def test_share_by_me(client):
    login(client)
    response = client.get('/share-by-me')
    assert response.status_code == 200
    assert b'Shared by me' in response.data
    assert b'<a class="tab-button active" href="/share-by-me">' in response.data
    assert b'<a class="tab-button active" href="/share-with-me">' not in response.data
    assert b'data-by-me="true"' in response.data


def test_trash(client):
    login(client)
    response = client.get('/trash')
    assert response.status_code == 200
    assert b'trash' in response.data.lower()

def test_public_notes(client):
    login(client)
    response = client.get('/public-notes')
    assert response.status_code == 200
    assert b'public' in response.data.lower()

def test_create_note(client):
    login(client)
    response = client.get('/create-note')
    assert response.status_code == 200
    assert b'note' in response.data.lower()

def test_notifications(client):
    login(client)
    response = client.get('/notifications')
    assert response.status_code == 200
    assert b'notifications' in response.data.lower()

def test_profile(client):
    login(client)
    response = client.get('/profile')
    assert response.status_code == 200
    assert b'profile' in response.data.lower()

def create_note_for_user(user_id):
    """Tạo ghi chú mẫu cho người dùng."""
    note = Note(
        user_id=user_id,
        title="Test Note",
        content="Some content",
        is_public=False,
        created_at=datetime.utcnow()
    )
    return note

def test_edit_note_owner_can_edit(client, app):
    login(client)
    with app.app_context():
        from website.models import User
        user = User.query.filter_by(email='testuser@example.com').first()
        note = create_note_for_user(user.id)
        from website import db
        db.session.add(note)
        db.session.commit()

        response = client.get(f'/edit-note/{note.id}')
        assert response.status_code == 200
        assert b'note' in response.data.lower()
        assert b'view_only' not in response.data  # vì chủ sở hữu được chỉnh sửa

def test_edit_note_shared_with_edit_permission(client, app):
    login(client)
    with app.app_context():
        from website.models import User
        user = User.query.filter_by(email='testuser@example.com').first()

        owner = User(
            first_name='Owner',
            last_name='User',
            email='owner@example.com',
            password_hash='hash',
            gender='male',
            role='user',
            status='Active'
        )
        from website import db
        db.session.add(owner)
        db.session.commit()

        note = create_note_for_user(owner.id)
        db.session.add(note)
        db.session.commit()

        shared = ShareNote(
            note_id=note.id,
            recipient_id=user.id,
            sharer_id=owner.id,
            can_edit=True
        )
        db.session.add(shared)
        db.session.commit()

        response = client.get(f'/edit-note/{note.id}')
        assert response.status_code == 200
        assert b'note' in response.data.lower()
        assert b'view_only' not in response.data  # có quyền chỉnh sửa

def test_edit_note_shared_view_only(client, app):
    login(client)
    with app.app_context():
        from website.models import User
        user = User.query.filter_by(email='testuser@example.com').first()

        owner = User(
            first_name='Owner2',
            last_name='User',
            email='owner2@example.com',
            password_hash='hash',
            gender='male',
            role='user',
            status='Active'
        )
        from website import db
        db.session.add(owner)
        db.session.commit()

        note = create_note_for_user(owner.id)
        db.session.add(note)
        db.session.commit()

        shared = ShareNote(
            note_id=note.id,
            recipient_id=user.id,
            sharer_id=owner.id,
            can_edit=False
        )
        db.session.add(shared)
        db.session.commit()

        response = client.get(f'/edit-note/{note.id}')
        assert response.status_code == 200
        assert b'note' in response.data.lower()


def test_edit_note_public_only(client, app):
    login(client)
    with app.app_context():
        from website.models import User
        user = User.query.filter_by(email='testuser@example.com').first()

        owner = User(
            first_name='PublicOwner',
            last_name='User',
            email='ownerpublic@example.com',
            password_hash='hash',
            gender='male',
            role='user',
            status='Active'
        )
        from website import db
        db.session.add(owner)
        db.session.commit()

        note = create_note_for_user(owner.id)
        note.is_public = True
        db.session.add(note)
        db.session.commit()

        response = client.get(f'/edit-note/{note.id}')
        assert response.status_code == 200
        assert b'note' in response.data.lower()

def test_edit_note_no_permission(client, app):
    login(client)
    with app.app_context():
        from website.models import User
        user = User.query.filter_by(email='testuser@example.com').first()

        owner = User(
            first_name='Unauthorized',
            last_name='User',
            email='unauth@example.com',
            password_hash='hash',
            gender='male',
            role='user',
            status='Active'
        )
        from website import db
        db.session.add(owner)
        db.session.commit()

        note = create_note_for_user(owner.id)
        note.is_public = False
        db.session.add(note)
        db.session.commit()

        response = client.get(f'/edit-note/{note.id}', follow_redirects=True)
        assert response.status_code == 200
        assert b'permission' in response.data.lower()