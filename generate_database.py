from website import create_app, db
from website.models import User, Note, ShareNote, Comment, UserWarning, UserNotification
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random
import uuid

app = create_app()

# Danh sách dữ liệu mẫu
first_names = ['Anh', 'Bình', 'Cường', 'Dung', 'Hà', 'Hùng', 'Khánh', 'Lan', 'Mai', 'Nam', 'Ngọc', 'Phương', 'Quân', 'Sơn', 'Thảo', 'Trang', 'Tuấn', 'Vân', 'Yến']
last_names = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý']
emails = [f'user{i}@example.com' for i in range(0, 101)]
genders = ['Male', 'Female']
roles = ['user', 'admin']
statuses = ['Active', 'Locked', 'Inactive']
colors = ['note-blue', 'note-green', 'note-purple']
tags_options = [
    ['python', 'flask'], ['html', 'css'], ['javascript', 'react'], 
    ['machine learning', 'ai'], ['math', 'logic'], ['database', 'sql'], 
    ['cloud', 'aws'], ['security', 'cyber']
]
reasons = ['inappropriate', 'copyright', 'spam', 'other']
notification_types = ['info', 'warning', 'success', 'error']

def random_date(start_date, end_date):
    """Tạo ngày ngẫu nhiên trong khoảng từ start_date đến end_date"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randrange(days_between)
    return start_date + timedelta(days=random_days)

with app.app_context():
    db.drop_all()
    db.create_all()

    users = []
    user = User(
        email='admin@example.com',
        password_hash=generate_password_hash('123456'),
        first_name='user',
        last_name='Admin',
        gender=random.choice(genders),
        role='admin'
    )
    db.session.add(user)
    users.append(user)
    
    for i in range(1, 50):
        user = User(
            email=emails[i],
            password_hash=generate_password_hash('123456'),
            first_name=random.choice(first_names),
            last_name=random.choice(last_names),
            gender=random.choice(genders),
            role='user',
            status=random.choice(statuses),
            created_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1))
        )
        users.append(user)
        db.session.add(user)
    db.session.commit()

    # Tạo 200 ghi chú
    notes = []
    for i in range(200):
        user = random.choice(users)
        note = Note(
            title=f"Note {i+1} by {user.first_name}",
            content={"blocks": [
                {"type": "paragraph", "data": {"text": f"Nội dung ghi chú số {i+1} bởi {user.first_name}."}},
                {"type": "paragraph", "data": {"text": f"Đây là một đoạn văn mẫu thứ hai cho ghi chú {i+1}."}}
            ]},
            color=random.choice(colors),
            tags=random.choice(tags_options),
            user_id=user.id,
            created_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)),
            updated_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)),
            is_trashed=random.choice([True, False]),
            deleted_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)) if random.random() < 0.2 else None,
            is_public=random.choice([True, False]),
            disable=random.choice([True, False])
        )
        notes.append(note)
        db.session.add(note)
    db.session.commit()

    # Tạo 100 lượt chia sẻ ghi chú, chỉ chia sẻ ghi chú mà người dùng là chủ
    share_notes = []
    for i in range(100):
        sharer = random.choice(users)
        # Chỉ chọn các ghi chú mà sharer là chủ sở hữu
        sharer_notes = [note for note in notes if note.user_id == sharer.id]
        if not sharer_notes:  # Nếu người dùng không có ghi chú, bỏ qua
            continue
        note = random.choice(sharer_notes)
        recipient = random.choice([u for u in users if u.id != sharer.id])
        share = ShareNote(
            note_id=note.id,
            sharer_id=sharer.id,
            recipient_id=recipient.id,
            shared_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)),
            can_edit=random.choice([True, False])
        )
        share_notes.append(share)
        db.session.add(share)

        # Add notification for the recipient
        notification = UserNotification(
            user_id=recipient.id,
            title=f"A note has been shared with you",
            message=f"{sharer.first_name} {sharer.last_name} shared a note titled '{note.title}' with you.",
            type='info',
            link=f"/edit-note/{note.id}",
            is_read=False,
            created_at=share.shared_at
        )
        db.session.add(notification)
    db.session.commit()

    # Tạo 300 bình luận
    comments = []
    for i in range(300):
        note = random.choice(notes)
        user = random.choice(users)
        comment = Comment(
            note_id=note.id,
            user_id=user.id,
            content=f"Bình luận {i+1} trên ghi chú {note.title}: Đây là một bình luận mẫu.",
            created_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1))
        )
        comments.append(comment)
        db.session.add(comment)
    db.session.commit()

    # Tạo 50 cảnh báo người dùng
    warnings = []
    admins = [u for u in users if u.role == 'admin']
    for i in range(50):
        user = random.choice(users)
        admin = random.choice(admins)
        note = random.choice(notes) if random.random() < 0.7 else None
        warning = UserWarning(
            user_id=user.id,
            note_id=note.id if note else None,
            admin_id=admin.id,
            reason=random.choice(reasons),
            message=f"Cảnh báo {i+1}: Nội dung có thể vi phạm chính sách ({random.choice(reasons)}).",
            created_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)),
            is_read=random.choice([True, False])
        )
        warnings.append(warning)
        db.session.add(warning)
    db.session.commit()

    # Tạo 200 thông báo
    notifications = []
    for i in range(200):
        user = random.choice(users)
        notification = UserNotification(
            user_id=user.id,
            title=f"Thông báo {i+1}",
            message=f"Đây là thông báo mẫu số {i+1} gửi đến {user.first_name}.",
            type=random.choice(notification_types),
            link=f"/dashboard/notification/{i+1}" if random.random() < 0.5 else None,
            created_at=random_date(datetime(2023, 1, 1), datetime(2025, 5, 1)),
            is_read=random.choice([True, False])
        )
        notifications.append(notification)
        db.session.add(notification)
    db.session.commit()

    print("✅ Đã tạo dữ liệu mẫu hoàn chỉnh:")
    print(f"- {len(users)} người dùng")
    print(f"- {len(notes)} ghi chú")
    print(f"- {len(share_notes)} lượt chia sẻ ghi chú")
    print(f"- {len(comments)} bình luận")
    print(f"- {len(warnings)} cảnh báo")
    print(f"- {len(notifications)} thông báo")