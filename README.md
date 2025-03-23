# Hệ Thống Sổ Tay Ghi Chú Bài Giảng

## Giới thiệu
Hệ thống sổ tay ghi chú bài giảng là một nền tảng trực tuyến giúp người dùng tạo, quản lý và chia sẻ các bản tóm tắt bài giảng một cách hiệu quả. Hệ thống hỗ trợ người dùng tìm kiếm, xem nội dung ghi chú, quản lý bản ghi cá nhân và theo dõi số lượng người đã xem bài giảng đó. Ngoài ra, hệ thống còn cung cấp giao diện quản trị để quản lý toàn bộ dữ liệu và người dùng.

### Thông tin sinh viên
- **Trịnh Nguyễn Hoàng Vũ - 22642231**
- **Kiều Trương Hàm Hương - 22719241**
- **Trần Thị Huyền - 22657821**
- **Phạm Thanh Thảo - 22695701**

## Công nghệ sử dụng
- **Python** (Flask Framework)
- **HTML, CSS, JavaScript** (Giao diện người dùng)
- **SQLite** (Cơ sở dữ liệu)
- **Bootstrap, CSS** (Thiết kế giao diện)
- **Jinja2** (Template Engine)
- **JWT Authentication** (Bảo mật đăng nhập)

## Chức năng chính
### Người dùng
- Đăng ký, đăng nhập, đăng xuất, quên mật khẩu
- Cập nhật thông tin cá nhân
- Tạo, chỉnh sửa, xóa, tìm kiếm và chia sẻ bản tóm tắt bài giảng
- Đánh giá và bình luận trên các bản tóm tắt bài giảng
- Sao chép bản tóm tắt để sử dụng cho mục đích cá nhân

### Quản trị viên
- Quản lý người dùng (xem danh sách, khóa/mở khóa tài khoản, đặt lại mật khẩu)
- Quản lý nội dung (xem xét, phê duyệt, yêu cầu chỉnh sửa, xóa nội dung không phù hợp)
- Giám sát và theo dõi lượng truy cập, xuất báo cáo thống kê

## Cấu trúc chính của thư mục dự án
```
Lecture-Review/
│── website/
│   ├── admin/ (Chứa giao diện web cho admin)
│   ├── static/ (Chứa file CSS, JS, hình ảnh)
│   ├── templates/ (Chứa các file HTML)
│   ├── __init__.py (Khởi tạo website)
│   ├── config.py (Cấu hình hệ thống)
│   ├── models.py (Định nghĩa mô hình dữ liệu)
│   ├── api.py (Xử lý các API)
│── main.py (Chạy ứng dụng Flask)
│── requirements.txt (Danh sách thư viện cần cài đặt)
│── README.md (Tài liệu hướng dẫn sử dụng)
```

## Cài đặt và chạy ứng dụng
### 1. Tải hệ thống
```bash
git clone <url>
cd Lecture-Review
```

### 2. Cài đặt môi trường ảo (khuyến nghị)
```bash
python -m venv venv
source venv/bin/activate  # Trên macOS/Linux
venv\Scripts\activate  # Trên Windows
```

### 3. Cài đặt các thư viện cần thiết
```bash
pip install -r requirements.txt
```

### 4. Chạy ứng dụng
```bash
python main.py
```
Ứng dụng sẽ chạy trên `http://127.0.0.1:5000/`

## Môi trường cấu hình
- `.env` file chứa các biến môi trường:
```
FLASK_APP=main.py
FLASK_ENV=development
SECRET_KEY=your_secret_key

DATABASE_URL=sqlite:///database.db

JWT_SECRET_KEY=your_jwt_secret_key

MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
```

## Ghi chú
- Đảm bảo đã cài đặt **Python 3.8+**
- Nếu sử dụng **PostgreSQL**, cần cập nhật `DATABASE_URL` trong file `.env`
