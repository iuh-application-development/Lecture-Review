from website import create_app, db
from website.models import User, Note, ShareNote, Comment, UserWarning, UserNotification
from werkzeug.security import generate_password_hash
from datetime import datetime
import random

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # Tạo tài khoản
    admin = User(
        email='admin@example.com',
        password_hash=generate_password_hash('123456'),
        first_name='Admin',
        last_name='User',
        gender='Male',
        role='admin',
        status='Active'
    )

    locked_user = User(
        email='locked@example.com',
        password_hash=generate_password_hash('123456'),
        first_name='Locked',
        last_name='User',
        gender='Male',
        role='user',
        status='Locked'
    )

    user1 = User(
        email='user1@example.com',
        password_hash=generate_password_hash('123456'),
        first_name='Alice',
        last_name='Nguyen',
        gender='Female'
    )

    user2 = User(
        email='user2@example.com',
        password_hash=generate_password_hash('123456'),
        first_name='Bob',
        last_name='Tran',
        gender='Male'
    )

    db.session.add_all([admin, locked_user, user1, user2])
    db.session.commit()

    # Tạo ghi chú
    notes = []
    colors = ['note-blue', 'note-green', 'note-purple']
    tags = [['flask', 'python'], ['html', 'css'], ['machine learning'], ['math', 'logic']]
    users = [user1, user2]

    for i in range(4):
        note = Note(
            title=f"Note {i+1} by {users[i % 2].first_name}",
            content={"blocks": [{"type": "paragraph", "data": {"text": f"Nội dung ghi chú {i+1}"}}]},
            color=random.choice(colors),
            tags=tags[i],
            user_id=users[i % 2].id
        )
        notes.append(note)
        db.session.add(note)

    db.session.commit()

    # Chia sẻ ghi chú
    share = ShareNote(
        note_id=notes[0].id,
        sharer_id=user1.id,
        recipient_id=user2.id,
        can_edit=True,
        message="Chia sẻ ghi chú đầu tiên"
    )
    db.session.add(share)

    # Comment
    comment = Comment(
        note_id=notes[0].id,
        user_id=user2.id,
        content="Ghi chú hay đấy!"
    )
    db.session.add(comment)

    # Warning
    warning = UserWarning(
        user_id=user2.id,
        note_id=notes[0].id,
        admin_id=admin.id,
        reason="inappropriate",
        message="Nội dung có thể không phù hợp."
    )
    db.session.add(warning)

    # Notification
    notify = UserNotification(
        user_id=user2.id,
        title="Thông báo hệ thống",
        message="Bạn đã nhận được một cảnh báo từ quản trị viên.",
        type="warning",
        link="/dashboard"
    )
    db.session.add(notify)

    db.session.commit()

    print("✅ Đã tạo dữ liệu mẫu hoàn chỉnh.")
