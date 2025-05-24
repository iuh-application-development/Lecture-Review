import pytest
from website import create_app, db
from website.models import User, Note
from werkzeug.security import generate_password_hash
from datetime import datetime


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "WTF_CSRF_ENABLED": False,  # Tắt CSRF khi test
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # DB in-memory sạch mỗi lần test
    })

    with app.app_context():
        db.create_all()

        # Thêm user test cho login
        user = User(
            first_name='Test',
            last_name='User',
            email='testuser@example.com',
            password_hash=generate_password_hash('testpassword'),
            gender='male',
            role='user',
            status='Active'
        )
        db.session.add(user)
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()


# @pytest.fixture
# def test_note(app):
#     with app.app_context():
#         from website.models import User
#         user = User.query.filter_by(email='testuser@example.com').first()
#         note = Note(
#             user_id=user.id,
#             title="Test Note",
#             content="This is a test note.",
#             is_public=False,
#             created_at=datetime.utcnow()
#         )
#         db.session.add(note)
#         db.session.commit()
#         yield note
#         db.session.delete(note)
#         db.session.commit()

@pytest.fixture
def auth_client(client):
    # Đăng nhập user đã tạo
    res = client.post("/login", json={
        "email": "testuser@example.com",
        "password": "testpassword"
    })

    # In log kiểm tra login có thành công không
    try:
        data = res.get_json()
        print("Login response:", data)
    except:
        print("Login failed or response is not JSON. Status:", res.status_code)

    return client
