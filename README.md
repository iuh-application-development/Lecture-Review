# LECTURE REVIEW

## 1. THÔNG TIN NHÓM

- Trịnh Nguyễn Hoàng Vũ - trinhnguyenhoangvu306@gmail.com
- Kiều Trương Hàm Hương - kthh135@gmail.com
- Trần Thị Huyền - tranthihuyen200412@gmail.com
- Phạm Thanh Thảo - thanhthao08112110@gmail.com

## 2. MÔ TẢ ĐỀ TÀI

### 2.1. Mô tả tổng quan
Hệ thống này là một ứng dụng web cho phép người dùng tạo, quản lý, chia sẻ ghi chú và có thể làm Quiz dể nhớ lại kiến thức. Ứng dụng nhằm giải quyết vấn đề quản lý kiến thức và tài liệu học tập một cách hiệu quả, đồng thời tạo môi trường để người dùng có thể chia sẻ kiến thức với nhau.

### 2.2. Mục tiêu
- Xây dựng hệ thống quản lý ghi chú với giao diện thân thiện, dễ sử dụng
- Hỗ trợ tạo và định dạng ghi chú với nội dung phong phú
- Cho phép người dùng chia sẻ ghi chú với người khác và tương tác qua bình luận
- Cung cấp hệ thống quản trị để kiểm soát nội dung và người dùng
- Đảm bảo bảo mật thông tin và dữ liệu người dùng
- Hỗ trợ tạo bài trắc nghiệm từ nội dung ghi chú để giúp người dùng ôn tập kiến thức

## 3. PHÂN TÍCH THIẾT KẾ

> **Lưu ý**: Để xem thông tin chi tiết hơn về các use case và đặc tả chức năng của hệ thống, vui lòng tham khảo [tài liệu đặc tả yêu cầu phần mềm (SRS.pdf)](./docs/SRS.pdf).

### 3.1. Phân tích yêu cầu
- Các yêu cầu chức năng:
  - Đăng ký, đăng nhập và quản lý tài khoản người dùng
  - Tạo, chỉnh sửa, xóa và khôi phục ghi chú
  - Chia sẻ ghi chú với người dùng khác
  - Thêm bình luận vào ghi chú được chia sẻ
  - Nhận thông báo khi có tương tác mới
  - Quản lý người dùng và nội dung (dành cho admin)
  - Tạo và làm bài trắc nghiệm từ nội dung ghi chú
- Các yêu cầu phi chức năng:
  - Bảo mật thông tin người dùng và dữ liệu
  - Giao diện người dùng thân thiện, dễ sử dụng
  - Hiệu suất nhanh và ổn định
  - Khả năng mở rộng hệ thống

### 3.2. Đặc tả yêu cầu

- Đặc tả chức năng "Đăng nhập"

| Mã Use case | UC001 | Tên Use case | Đăng nhập |
|-------------|-------|--------------|-----------|
| Tác nhân | Người dùng | | |
| Mô tả | Tác nhân đăng nhập vào hệ thống sử dụng các chức năng | | |
| Sự kiện kích hoạt | Click vào nút đăng nhập trên giao diện website | | |
| Tiền điều kiện | Tác nhân đã có tài khoản trên hệ thống | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn chức năng đăng nhập | 2. Hiển thị giao diện đăng nhập |
| | 3. Nhập Email và Password | |
| | 4. Yêu cầu đăng nhập | 5. Kiểm tra xem khách đã nhập các trường bắt buộc hay chưa |
| | | 6. Kiểm tra Email và Password có hợp lệ do khách nhập trong hệ thống hay không |
| | | 7. Hiển thị các chức năng tương ứng với vai trò người dùng |
| Luồng sự kiện thay thế | 6a. Hệ thống báo lỗi: Cần nhập các trường bắt buộc nhập | |
| | 7a. Hệ thống báo lỗi: Email/Password chưa đúng | |
| Hậu điều kiện | Tác nhân đăng nhập được vào hệ thống | |

- Đặc tả chức năng "Thay đổi mật khẩu"

| Mã Use case | UC002 | Tên Use case | Thay đổi mật khẩu |
|-------------|-------|--------------|-------------------|
| Tác nhân | Người dùng, Quản trị viên | | |
| Mô tả | Tác nhân muốn thay đổi mật khẩu của tài khoản | | |
| Sự kiện kích hoạt | Click vào nút thay đổi mật khẩu trên giao diện website | | |
| Tiền điều kiện | Tác nhân có quyền thay đổi mật khẩu | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn chức năng "Thay đổi mật khẩu" | 2. Hiển thị giao diện thay đổi mật khẩu |
| | 3. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới | |
| | 4. Yêu cầu thay đổi mật khẩu | 5. Kiểm tra xem khách đã nhập các trường bắt buộc hay chưa |
| | | 6. Kiểm tra mật khẩu hiện tại có chính xác không |
| | | 7. Kiểm tra tính hợp lệ của mật khẩu mới |
| | | 8. Hệ thống gửi mã xác thực (OTP) qua email của tác nhân |
| | 9. Nhập mã xác thực vào hệ thống | 10. Kiểm tra mã xác thực có hợp lệ không |
| | | 11. Cập nhật mật khẩu mới vào hệ thống |
| | | 12. Hiển thị thông báo thành công và yêu cầu tác nhân đăng nhập lại |
| Luồng sự kiện thay thế | 6a. Hệ thống báo lỗi: Cần nhập các trường bắt buộc nhập | |
| | 7a. Hệ thống báo lỗi: Mật khẩu cũ không chính xác | |
| | 8a. Hệ thống báo lỗi: Mật khẩu mới không được trùng với mật khẩu hiện tại nếu tác nhân nhập trùng khớp | |
| | 8b. Hệ thống báo lỗi: Mật khẩu mới không đạt đủ các điều kiện ràng buộc | |
| | 8c. Hệ thống báo lỗi: | |
| | 11a. Hệ thống báo lỗi: mã xác thực (OTP) không chính xác | |
| Hậu điều kiện | Tác nhân cập nhật được mật khẩu và phải đăng nhập lại | |

- Đặc tả chức năng "Thiết lập lại mật khẩu"

| Mã Use case | UC003 | Tên Use case | Thiết lập lại mật khẩu |
|-------------|-------|--------------|------------------------|
| Tác nhân | Người dùng, Quản trị viên | | |
| Mô tả | Tác nhân quên mật khẩu và yêu cầu thiết lập lại mật khẩu mới bằng cách nhận OTP qua địa chỉ email xác nhận | | |
| Sự kiện kích hoạt | Click vào nút quên mật khẩu trên giao diện đăng nhập | | |
| Tiền điều kiện | Email của tác nhân phải tồn tại trong hệ thống | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn chức năng quên mật khẩu | 2. Hiển thị giao diện nhập email |
| | 3. Nhập email và yêu cầu thiết lập lại mật khẩu | 4. Kiểm tra xem khách đã nhập các trường bắt buộc hay chưa |
| | | 5. Kiểm tra email có tồn tại trong hệ thống không |
| | | 6. Hệ thống gửi mã xác thực (OTP) qua email của tác nhân |
| | 7. Nhập mã xác thực vào hệ thống | 8. Kiểm tra mã xác thực có hợp lệ không |
| | | 9. Hiển thị giao diện thiết lập lại mật khẩu |
| | 10. Nhập mật khẩu mới và xác nhận mật khẩu mới | 11. Kiểm tra tính hợp lệ của mật khẩu mới |
| | | 12. Cập nhật mật khẩu mới vào hệ thống |
| | | 13. Hiển thị thông báo thành công và yêu cầu tác nhân đăng nhập lại |
| Luồng sự kiện thay thế | 4a. Hệ thống báo lỗi: Cần nhập các trường bắt buộc nhập | |
| | 5a. Hệ thống báo lỗi: Email không tồn tại trong hệ thống | |
| | 8a. Hệ thống báo lỗi: Mã xác thực (OTP) không chính xác | |
| | 12a. Hệ thống báo lỗi: Mật khẩu mới không được trùng với mật khẩu cũ nếu tác nhân nhập trùng khớp | |
| | 12b. Hệ thống báo lỗi: Mật khẩu mới không đạt đủ các điều kiện ràng buộc | |
| | 12c. Hệ thống báo lỗi: Mật khẩu mới không trùng khớp với xác nhận mật khẩu | |
| Hậu điều kiện | Tác nhân có thể đăng nhập vào hệ thống bằng mật khẩu mới | |

- Đặc tả chức năng "Đăng ký"

| Mã Use case | UC004 | Tên Use case | Đăng ký |
|-------------|-------|--------------|---------|
| Tác nhân | Người dùng | | |
| Mô tả | Khách đăng ký tài khoản mới trên hệ thống bằng cách cung cấp thông tin cá nhân như họ tên, email, mật khẩu... và xác thực tài khoản qua email | | |
| Sự kiện kích hoạt | Click vào nút đăng ký trên giao diện website | | |
| Tiền điều kiện | Tác nhân chưa có tài khoản trên hệ thống | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn chức năng đăng ký tài khoản | 2. Hiển thị giao diện đăng ký tài khoản với các trường thông tin cần điền |
| | 3. Điền thông tin đăng ký (họ tên, email, mật khẩu...) | |
| | 4. Nhấn nút "Đăng ký" | 5. Kiểm tra xem người dùng đã nhập các trường bắt buộc hay chưa |
| | | 6. Kiểm tra xem người dùng đã nhập các trường hợp lệ hay chưa (email đúng định dạng, mật khẩu đủ mạnh...) |
| | | 7. Tạo tài khoản tạm thời và gửi mã xác thực (OTP) qua email cho người dùng |
| | | 8. Hiển thị giao diện nhập mã xác thực cho người dùng |
| | 9. Nhập mã xác thực vào hệ thống và nhấn "Xác nhận" | 10. Kiểm tra mã xác thực (OTP) có hợp lệ không |
| | | 11. Kích hoạt tài khoản và thông báo "Tài khoản đăng ký thành công" |
| Luồng sự kiện thay thế | 5a. Hệ thống báo lỗi: Cần nhập các trường bắt buộc nhập | |
| | 6a. Hệ thống báo lỗi: Email chưa đúng định dạng hoặc đã tồn tại | |
| | 6b. Hệ thống báo lỗi: Password không đủ mạnh, yêu cầu nhập lại theo yêu cầu bảo mật | |
| | 7a. Hệ thống thông báo lỗi: Không thể gửi mã OTP, vui lòng thử lại | |
| | 9a. Nhập sai OTP và nhấn xác nhận | |
| | 10a. Hiển thị thông báo lỗi: Mã OTP không hợp lệ, vui lòng nhập lại | |
| | 10b. Hiển thị thông báo lỗi: Mã OTP đã hết hạn, vui lòng yêu cầu mã mới | |
| | 11a.. Nếu lỗi hệ thống, hệ thống báo lỗi: Đăng ký không thành công, vui lòng thử lại | |
| Hậu điều kiện | Tài khoản mới được tạo và lưu trữ trong hệ thống. Người dùng có thể đăng nhập vào hệ thống với tài khoản vừa mới đăng ký | |

- Đặc tả chức năng "Cập nhật thông tin cá nhân"

| Mã Use case | UC005 | Tên Use Case | Cập nhật thông tin cá nhân |
|-------------|-------|--------------|---------------------------|
| Tác nhân | Người dùng, Quản trị viên | | |
| Mô tả | Tác nhân cập nhật thông tin cá nhân | | |
| Sự kiện kích hoạt | Tác nhân vào trang "Cập nhật thông tin cá nhân" và thực hiện chỉnh sửa thông tin cá nhân của mình | | |
| Tiền điều kiện | Tác nhân đăng nhập thành công | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn chức năng "Cập nhật thông tin cá nhân" | |
| | | 2. Hiển thị giao diện cập nhật thông tin cá nhân |
| | 3. Điền thông tin cần cập nhật | |
| | 4. Yêu cầu cập nhật | 5. Kiểm tra thông tin nhập liệu của người dùng |
| | | 6. Cập nhật và thông báo thành công |
| Luồng sự kiện thay thế | 6a. Thông báo lỗi nếu kiểm tra thông tin nhập liệu không đúng định dạng | |
| | 7a. Thông báo lỗi nếu hệ thống không thể cập nhật thông tin | |
| Hậu điều kiện | Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống | |

- Đặc tả chức năng "CRUD bản tóm tắt"

| Mã Use case | UC006 | Tên Use case | CRUD bản tóm tắt |
|-------------|-------|--------------|-----------------|
| Tác nhân | Người dùng, Quản trị viên | | |
| Mô tả | Tác nhân thực hiện các thao tác quản lý bản tóm tắt bài giảng | | |
| Sự kiện kích hoạt | Tác nhân chọn Tạo, Xem, Chỉnh sửa hoặc Xóa trên giao diện hệ thống | | |
| Tiền điều kiện | Người dùng có quyền thực hiện các thao tác với bản tóm tắt | | |

#### Tạo bản tóm tắt (Create)

| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
|----------------------------------|--------------|-------------|
| | 1. Chọn chức năng "Tạo bản tóm tắt" | 2. Hiển thị giao diện nhập nội dung bản tóm tắt, hỗ trợ định dạng văn bản (Markdown/Latex), chèn hình ảnh |
| | 3. Nhập tiêu đề, nội dung bản tóm tắt | |
| | 4. Nhấn "Lưu" để hoàn thành tạo mới | 5. Kiểm tra dữ liệu đầu vào hợp lệ |
| | | 6. Lưu bản tóm tắt vào hệ thống |
| | | 7. Hiển thị thông báo thành công |
| Luồng sự kiện thay thế | 6a. Hệ thống thông báo lỗi "Tiêu đề/Nội dung không được để trống", khi tác nhân chưa nhập tiêu đề/nội dung | |
| | 6b. Hệ thống thông báo lỗi "Nội dung có chứa những từ ngữ không hợp lệ", nếu trong nội dung của bản tóm tắt có chứa những từ không phù hợp quy tắc | |
| | 6c. Hệ thống thông báo lỗi "Không thể lưu bây giờ, vui lòng thử lại sau", nếu hệ thống có trục trặc trong quá trình xử lý | |

#### Xem bản tóm tắt (Read)

| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
|----------------------------------|--------------|-------------|
| | 1. Chọn chức năng "Danh sách bản tóm tắt" | 2. Hiển thị danh sách bản tóm tắt đã tạo hoặc được chia sẻ, sắp xếp theo thời gian cập nhật |
| | 3. Chọn một bản tóm tắt để xem chi tiết | 4. Hiển thị nội dung đầy đủ của bản tóm tắt |
| Luồng sự kiện thay thế | Không có | |

#### Chỉnh sửa bản tóm tắt (Update)

| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
|----------------------------------|--------------|-------------|
| | 1. Chọn một bản tóm tắt và nhấn "Chỉnh sửa" | 2. Hiển thị giao diện chỉnh sửa nội dung bản tóm tắt |
| | 3. Cập nhật nội dung và nhấn "Lưu thay đổi" | 4. Kiểm tra dữ liệu đầu vào hợp lệ |
| | | 5. Cập nhật bản tóm tắt trong hệ thống |
| | | 6. Hiển thị thông báo cập nhật thành công |
| Luồng sự kiện thay thế | 5a. Hệ thống thông báo lỗi "Tiêu đề/Nội dung không được để trống", khi tác nhân chưa nhập tiêu đề/nội dung | |
| | 5b. Hệ thống thông báo lỗi "Nội dung có chứa những từ ngữ không hợp lệ", nếu trong nội dung của bản tóm tắt có chứa những từ không phù hợp quy tắc | |
| | 6a. Hệ thống thông báo lỗi "Không thể lưu bây giờ, vui lòng thử lại sau" | |

#### Xóa bản tóm tắt (Delete)

| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
|----------------------------------|--------------|-------------|
| | 1. Chọn một bài tóm tắt cần xóa | |
| | 2. Nhấn "Xóa" | 3. Hệ thống yêu cầu xác nhận xóa |
| | 4. Xác nhận xóa | 5. Hệ thống xóa bản tóm tắt |
| | | 6. Hiển thị thông báo xóa thành công |
| Luồng sự kiện thay thế | 3a. Hệ thống thông báo lỗi "Không thể xóa bản tóm tắt", khi người dùng không đủ quyền hạn để xóa bản tóm tắt | |
| | 6a. Hệ thống thông báo lỗi "Không thể xóa bây giờ, vui lòng thử lại sau", nếu hệ thống gặp trục trặc trong quá trình xử lý | |
| Hậu điều kiện | Hệ thống cập nhật danh sách bản tóm tắt người dùng | |

- Đặc tả chức năng "Tìm kiếm bản tóm tắt"

| Mã Use case | UC007 | Tên Use case | Tìm kiếm bản tóm tắt |
|-------------|-------|--------------|---------------------|
| Tác nhân | Người dùng, Quản trị viên | | |
| Mô tả | Người dùng có thể tìm kiếm và xem các bản tóm tắt bài giảng được công khai bằng cách nhập từ khóa hoặc tên chủ sở hữu | | |
| Sự kiện kích hoạt | Nhập từ khóa tìm kiếm và nhấn nút tìm kiếm | | |
| Tiền điều kiện | Các bản tóm tắt được đăng tải công khai hoặc được chia sẻ với người dùng | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Nhập từ khóa tìm kiếm và nhấn nút tìm kiếm | 2. Kiểm tra từ khóa và thực hiện tìm kiếm trong cơ sở dữ liệu |
| | | 3. Hiển thị danh sách các bản tóm tắt phù hợp với từ khóa tìm kiếm |
| | 4. Chọn một bản tóm tắt từ danh sách kết quả | 5. Hiển thị nội dung của bản tóm tắt |
| Luồng sự kiện thay thế | 2a. Hệ thống báo lỗi: Không tìm thấy bản tóm tắt phù hợp | |
| | 5a. Hệ thống báo lỗi: Đây không phải bản tóm tắt công khai, vui lòng đăng nhập để xem | |
| Hậu điều kiện | Tác nhân có thể tìm kiếm và xem bản tóm tắt | |

- Đặc tả chức năng "Chia sẻ bản tóm tắt"

| Mã Use case | UC008 | Tên Use case | Chia sẻ bản tóm tắt |
|-------------|-------|--------------|-------------------|
| Tác nhân | Người dùng đã đăng nhập vào hệ thống | | |
| Mô tả | Người dùng chia sẻ một bản tóm tắt bài giảng của mình với người khác thông qua các phương thức chia sẻ như email, mạng xã hội, hoặc liên kết trực tiếp | | |
| Sự kiện kích hoạt | Click vào biểu tượng chia sẻ trên giao diện của bản tóm tắt | | |
| Tiền điều kiện | Người dùng đã đăng nhập vào hệ thống và có ít nhất một bản tóm tắt | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn một bản tóm tắt bài giảng cụ thể và nhấn vào nút "Chia sẻ" | 2. Hiển thị các phương thức chia sẻ như: email, mạng xã hội (FB, Twitter...), sao chép liên kết trực tiếp |
| | 3. Chọn một trong các phương thức chia sẻ (vd: email, facebook, sao chép liên kết) | 4. <br>- Yêu cầu nhập địa chỉ email của người nhận (nếu chia sẻ qua email)<br>- Mở cửa sổ chia sẻ của mạng xã hội tương ứng (nếu người dùng chọn chia sẻ qua mạng xã hội)<br>- Sao chép liên kết vào clipboard (nếu người chọn sao chép liên kết) |
| | 5. <br>- Nhập địa chỉ email người nhận (nếu chọn chia sẻ qua email) và nhấn nút "Gửi"<br>- Thực hiện các bước chia sẻ trên nền tảng xã hội (nếu chọn chia sẻ qua mạng xã hội)<br>- Dán liên kết vào nơi cần chia sẻ (nếu chọn sao chép liên kết) | 6. <br>- Gửi email chứa liên kết bản tóm tắt bài giảng đến địa chỉ email của người nhận (nếu chia sẻ qua email)<br>- Hiển thị thông báo "chia sẻ thành công" nếu chia sẻ qua mạng xã hội hoặc sao chép liên kết |
| Luồng sự kiện thay thế | 1a. Hệ thống báo lỗi: Không thể chia sẻ. Vui lòng kiểm tra kết nối Internet | |
| | 5a. Hệ thống báo lỗi: Vui lòng nhập địa chỉ email | |
| | 5b. Hệ thống báo lỗi: Email chưa đúng định dạng | |
| Hậu điều kiện | Bản tóm tắt bài giảng được chia sẻ thành công qua phương thức người dùng chọn<br>Người nhận có thể mở và xem bản tóm tắt mà người dùng chia sẻ | |

- Đặc tả chức năng "Sao chép bản tóm tắt"

| Mã Use case | UC009 | Tên Use case | Sao chép bản tóm tắt |
|-------------|-------|--------------|---------------------|
| Tác nhân | Người dùng | | |
| Mô tả | Sao chép bản tóm tắt bài giảng đã được công khai | | |
| Sự kiện kích hoạt | Người dùng nhấn vào chức năng "Sao chép bản tóm tắt" trong giao diện hệ thống | | |
| Tiền điều kiện | Đăng nhập thành công vào hệ thống và có quyền truy cập vào bản tóm tắt cần sao chép | | |
| Luồng sự kiện chính (thành công) | **Tác Nhân** | **Hệ Thống** |
| | 1. Chọn chức năng sao chép bản tóm tắt | |
| | | 2. Hiển thị giao diện sao chép bản tóm tắt |
| | 3. Chọn bản tóm tắt cần sao chép | |
| | 4. Yêu cầu sao chép bản tóm tắt | |
| | | 5. Kiểm tra thông tin của bản tóm tắt |
| | | 6. Sao chép thành công và hiển thị thông báo |
| Luồng sự kiện thay thế | 5a. Thông báo lỗi nếu không tìm thấy bản tóm tắt cần sao chép | |
| | 6a. Thông báo lỗi nếu hệ thống không thể sao chép bản tóm tắt | |
| Hậu điều kiện | Bản tóm tắt mới sẽ được sao chép thành công và người dùng có thể chỉnh sửa hoặc sử dụng bản sao cho mục đích cá nhân | |

- Đặc tả chức năng "Đánh giá bản tóm tắt"

| Mã Use case | UC010 | Tên Use case | Đánh giá bản tóm tắt |
|-------------|-------|--------------|---------------------|
| Tác nhân | Người dùng | | |
| Mô tả | Tác nhân thực hiện đánh giá, bình luận hoặc góp ý, cải thiện chất lượng thông qua ô nhập nội dung đánh giá hiển thị ngay bên dưới nội dung bài giảng | | |
| Sự kiện kích hoạt | Tác nhân chọn một bản tóm tắt bài giảng để xem và nhấn vào ô "Đánh giá" nằm ngay phía dưới nội dung bản tóm tắt bài giảng đang xem | | |
| Tiền điều kiện | Tác nhân đang xem nội dung chi tiết của bản tóm tắt bài giảng | | |
| Luồng sự kiện chính (thành công) | **Tác nhân** | **Hệ thống** |
| | 1. Chọn một bản tóm tắt bài giảng cụ thể để xem | 2. Hiển thị nội dung bản tóm tắt, các đánh giá và bình luận hiện có |
| | 3. Nhấn vào ô nhập nội dung "Đánh giá" | |
| | 4. Nhập nội dung đánh giá vào ô nhập | |
| | 5. Nhấn nút "Gửi đánh giá" | 6. Kiểm tra nội dung đánh giá hợp lệ (không trống, không vi phạm quy định, ...) |
| | | 7. Lưu nội dung đánh giá vào cơ sở dữ liệu và hiển thị ngay lập tức bên dưới nội dung bản tóm tắt |
| | | 8. Hiển thị thông báo "Đánh giá của bạn đã được ghi nhận" |
| Luồng sự kiện thay thế | 7a. Hệ thống thông báo "Vui lòng nhập nội dung đánh giá" nếu người dùng để trống ô đánh giá | |
| | 7b. Hệ thống thông báo "Nội dung đánh giá không hợp lệ" nếu phát hiện nội dung vi phạm quy định cộng đồng | |
| | 8a. Thông báo lỗi "Không thể gửi đánh giá, vui lòng thử lại sau" khi gặp lỗi hệ thống | |
| Hậu điều kiện | - Đánh giá được lưu và hiển thị ngay bên dưới nội dung bản tóm tắt<br>- Chủ sở hữu bản tóm tắt được thông báo khi có đánh giá mới | |

### 3.3. Thiết kế hệ thống
#### Use case diagram

1. **Tổng quan hệ thống**
   ![Tổng quan hệ thống](./docs/use-case/general_usecase.png)

2. **Người dùng sử dụng phần mềm**
   ![Phần mềm](./docs/use-case/use_software.png)

3. **Use case cho người dùng**
   ![User use cases](./docs/use-case/user_usecase.png)

4. **Use case cho quản trị viên**
   ![Admin use cases](./docs/use-case/admin_usecase.png)

#### Thiết kế CSDL
![Sơ đồ cơ sở dữ liệu](./docs/database/db-diagram.gif)

Để xem sơ đồ cơ sở dữ liệu chi tiết và tương tác, truy cập [Sơ đồ CSDL trên dbdiagram.io](https://dbdiagram.io/d/682844f21227bdcb4eba6be4)

#### Thiết kế giao diện
1. **Màn hình đăng nhập**
   ![Đăng nhập](./docs/web-interface/login.png)

2. **Màn hình đăng ký**
   ![Đăng ký](./docs/web-interface/register.png)

3. **Trang chủ (Home)**
   ![Trang chủ](./docs/web-interface/home.png)

4. **Bảng điều khiển người dùng**
   ![Dashboard người dùng](./docs/web-interface/dashboard-user.png)

5. **Tạo bản tóm tắt mới**
   ![Tạo bản tóm tắt](./docs/web-interface/create-note.png)

6. **Quản lý tất cả bản tóm tắt**
   ![Tất cả bản tóm tắt](./docs/web-interface/all-my-notes.png)

7. **Chia sẻ bản tóm tắt**
   ![Chia sẻ bản tóm tắt](./docs/web-interface/share-notes.png)

8. **Thùng rác**
   ![Thùng rác](./docs/web-interface/trash.png)

9. **Bảng điều khiển quản trị viên**
   ![Admin dashboard](./docs/web-interface/admin-dashboard.png)

10. **Quản lý người dùng (Admin)**
    ![Quản lý người dùng](./docs/web-interface/manage-users.png)

11. **Quản lý nội dung (Admin)**
    ![Quản lý nội dung](./docs/web-interface/manage-contents.png)

Các màn hình được thiết kế theo phong cách phẳng (flat design), sử dụng bảng màu hài hòa, với các thành phần giao diện được bố trí hợp lý, giúp người dùng dễ dàng tương tác và sử dụng các chức năng của hệ thống.

## 4. CÔNG CỤ VÀ CÔNG NGHỆ SỬ DỤNG

- Ngôn ngữ lập trình: Python
- Framework: Flask (framework web)
- Cơ sở dữ liệu: SQLite (lưu trong instance/database.db)
- Frontend: HTML, CSS, JavaScript
- IDE: Visual Studio Code
- Docker: Containerization

## 5. TRIỂN KHAI

### 5.1. Yêu cầu hệ thống
- Python 3.9 trở lên
- PIP (Python package manager)
- Git
- Docker (nếu triển khai bằng container)
- Google Cloud CLI (nếu triển khai trên Google Cloud Run)

### 5.2. Clone repository và cài đặt môi trường

#### 5.2.1. Clone repository từ GitHub
```bash
git clone <repository_url>
cd Lecture-Review
```

#### 5.2.2. Thiết lập môi trường ảo với venv
```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Trên Windows
venv\Scripts\activate

# Trên Linux/macOS
source venv/bin/activate
```

#### 5.2.3. Cài đặt các thư viện phụ thuộc
```bash
pip install -r requirements.txt
```

### 5.3. Cấu hình ứng dụng

#### 5.3.1. Cấu hình biến môi trường
Tạo file `.env` trong thư mục gốc của dự án và thiết lập các biến môi trường sau:

```
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password
```

### 5.4. Chạy và phát triển ứng dụng

#### 5.4.1. Khởi tạo cơ sở dữ liệu
```bash
python generate_database.py
```

#### 5.4.2. Chạy ứng dụng ở môi trường phát triển
```bash
python main.py
```

Ứng dụng sẽ chạy ở địa chỉ: http://localhost:8080

### 5.5. Đóng gói và triển khai với Docker

#### 5.5.1. Xây dựng Docker image
```bash
docker build -t lecture-review:latest .
```

#### 5.5.2. Chạy container từ image đã tạo
```bash
docker run -p 8080:8080 -e SECRET_KEY=your_secret_key -e JWT_SECRET_KEY=your_jwt_secret_key -e MAIL_USERNAME=your_email@gmail.com -e MAIL_PASSWORD=your_email_password lecture-review:latest
```

### 5.6. Triển khai lên Google Cloud Run

#### 5.6.1. Đăng nhập vào Google Cloud
```bash
gcloud auth login
```

#### 5.6.2. Cấu hình Google Cloud project
```bash
gcloud config set project YOUR_PROJECT_ID
```

#### 5.6.3. Xây dựng và đẩy Docker image lên Google Container Registry
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lecture-review
```

#### 5.6.4. Triển khai lên Google Cloud Run
```bash
gcloud run deploy lecture-review --image gcr.io/YOUR_PROJECT_ID/lecture-review --platform managed --region asia-southeast1 --allow-unauthenticated --set-env-vars="SECRET_KEY=your_secret_key,JWT_SECRET_KEY=your_jwt_secret_key,MAIL_USERNAME=your_email@gmail.com,MAIL_PASSWORD=your_email_password"
```

### 5.7. Quản lý triển khai

#### 5.7.1. Giám sát ứng dụng
- Sau khi triển khai lên Google Cloud Run, bạn có thể giám sát ứng dụng qua Cloud Console
- Xem logs: 
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lecture-review" --limit 50
  ```

#### 5.7.2. Cập nhật ứng dụng
- Thực hiện các thay đổi trên mã nguồn
- Xây dựng và đẩy Docker image mới
- Triển khai lại lên Cloud Run hoặc cập nhật phiên bản container
  
#### 5.7.3. Sao lưu dữ liệu
- Sao lưu cơ sở dữ liệu SQLite định kỳ
- Cân nhắc sử dụng cơ sở dữ liệu có tính sao lưu tự động như Cloud SQL cho môi trường sản phẩm

## 6. KIỂM THỬ
- Thực hiện kiểm thử chức năng (Functional Testing)
- Kiểm thử hiệu năng (Performance Testing)

## 7. KẾT QUẢ
[Viết các kết quả đạt được sau khi hoàn thành đề tài, có thể sử dụng hình ảnh hoặc bảng biểu để minh họa.]

### 7.1. Kết quả đạt được
- [Kết quả 1]
- [Kết quả 2]

### 7.2. Kết quả chưa đạt được
- [Kết quả chưa đạt được 1]
- [Kết quả chưa đạt được 2]

### 7.3. Hướng phát triển
- Tích hợp trí tuệ nhân tạo để gợi ý và tóm tắt nội dung
- Cải thiện hệ thống phân tích dữ liệu và báo cáo cho quản trị viên
- Nâng cao thuật toán tạo trắc nghiệm với AI để sinh ra câu hỏi chất lượng cao hơn
- Thêm tính năng chia sẻ bài trắc nghiệm và tổ chức thi đua giữa người dùng

## 8. TÀI LIỆU THAM KHẢO
- Flask Documentation: https://flask.palletsprojects.com/
- WeasyPrint: https://weasyprint.org/
- MDN Web Docs (HTML, CSS, JavaScript): https://developer.mozilla.org/
- Bootstrap Documentation: https://getbootstrap.com/docs/
- Python Documentation: https://docs.python.org/
- W3Schools Online Web Tutorials: https://www.w3schools.com/
