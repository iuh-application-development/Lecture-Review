from website import create_app, db
from website.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Tạo tài khoản bị khóa
    locked_user = User(
        email='locked@example.com',
        password_hash=generate_password_hash('123456', method='pbkdf2:sha256'),
        first_name='Locked',
        last_name='User',
        gender='Male',
        role='user',
        status='Locked'
        
    )
    
    # Tạo tài khoản admin
    admin_user = User(
        email='admin@example.com',
        password_hash=generate_password_hash('123456', method='pbkdf2:sha256'),
        first_name='Admin',
        last_name='User',
        gender='Male',
        role='admin',
        status='Active'
    )
    
    # Thêm vào database
    db.session.add(locked_user)
    db.session.add(admin_user)
    db.session.commit()
    
    print("Đã tạo tài khoản thành công!")
    print("Tài khoản bị khóa:")
    print(f"Email: locked@example.com")
    print(f"Mật khẩu: 123456")
   
    print("\nTài khoản admin:")
    print(f"Email: admin@example.com")
    print(f"Mật khẩu: 123456") 