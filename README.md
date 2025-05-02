# Lecture-Review: Hệ Thống Sổ Tay Ghi Chú Bài Giảng

## Giới thiệu

Lecture-Review là một nền tảng trực tuyến giúp người dùng dễ dàng tạo, quản lý và chia sẻ các bản tóm tắt bài giảng. Hệ thống này hỗ trợ tối ưu hóa việc học tập và cộng tác thông qua việc chia sẻ kiến thức với cộng đồng.

## Thông tin nhóm phát triển

- **Trịnh Nguyễn Hoàng Vũ** - 22642231
- **Kiều Trương Hàm Hương** - 22719241
- **Trần Thị Huyền** - 22657821
- **Phạm Thanh Thảo** - 22695701

## Công nghệ sử dụng

- **Backend**: Python (Flask Framework)
- **Frontend**: HTML, CSS, JavaScript
- **Cơ sở dữ liệu**: SQLite
- **Thiết kế giao diện**: Bootstrap, CSS
- **Template Engine**: Jinja2

## Chức năng chính

### Dành cho người dùng
- Đăng ký, đăng nhập và khôi phục mật khẩu.
- Cập nhật thông tin cá nhân.
- Tạo, chỉnh sửa, xóa, tìm kiếm và chia sẻ các bản tóm tắt bài giảng.
- Đánh giá và bình luận trên các bản tóm tắt.
- Xuất bản tóm tắt dưới dạng PDF.

### Dành cho quản trị viên
- Quản lý người dùng: Khóa/mở khóa tài khoản, đặt lại mật khẩu.
- Quản lý nội dung: Phê duyệt, yêu cầu chỉnh sửa hoặc xóa nội dung không phù hợp.
- Theo dõi thống kê lượng truy cập.

## Hướng dẫn cài đặt và chạy ứng dụng

### 1. Tải mã nguồn
```bash
git clone https://github.com/iuh-application-development/Lecture-Review.git
cd Lecture-Review
```

### 2. Thiết lập môi trường ảo (khuyến nghị)
```bash
python -m venv venv
# Trên macOS/Linux:
source venv/bin/activate
# Trên Windows:
venv\Scripts\activate
```

### 3. Cài đặt các thư viện phụ thuộc
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Chạy ứng dụng
```bash
python main.py
```
Ứng dụng sẽ chạy tại: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## Cấu trúc thư mục chính

```plaintext
Lecture-Review/
│── website/
│   ├── static/        # Tệp tĩnh (CSS, JS, hình ảnh)
│   │   ├── css/       # Tệp CSS
│   │   ├── images/    # Hình ảnh
│   │   └── js/        # Tệp JavaScript
│   ├── templates/     # Tệp HTML
│   │   ├── admin/     # Giao diện quản trị viên
│   ├── utils/         # Tiện ích bổ sung (ví dụ: chuyển đổi PDF)
│   ├── __init__.py    # Khởi tạo ứng dụng Flask
│   ├── config.py      # Cấu hình hệ thống
│   ├── views.py       # Xử lý giao diện người dùng
│   ├── auth.py        # Xử lý xác thực
│   ├── admin.py       # Xử lý giao diện quản trị viên
│   ├── api.py         # API
│   ├── models.py      # Định nghĩa cơ sở dữ liệu
│   ├── mailer.py      # Xử lý gửi email
│── .env               # Biến môi trường
│── main.py            # Tệp chính để chạy ứng dụng
│── requirements.txt   # Danh sách thư viện cần thiết
│── README.md          # Tài liệu hướng dẫn dự án
```

## Cấu hình môi trường

Tạo file `.env` trong thư mục gốc và thêm các biến sau:
```plaintext
FLASK_APP=main.py
FLASK_ENV=development
SECRET_KEY=your_secret_key

DATABASE_URL=sqlite:///database.db

JWT_SECRET_KEY=your_jwt_secret_key

MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
```

## Ghi chú quan trọng

- Yêu cầu Python phiên bản **3.8+**.
- Nếu sử dụng PostgreSQL, cập nhật `DATABASE_URL` trong file `.env`.

---

Hãy bắt đầu sử dụng Lecture-Review để tối ưu hóa việc học tập của bạn ngay hôm nay!