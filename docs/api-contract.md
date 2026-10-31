API Contract – Mekong Mobile CRM – Bài tập 2 (Track SE, L1)
Căn cứ: các file src/routes/auth.routes.js, customer.routes.js, duplicate.routes.js, merge.routes.js được kiểm tra ngày 31/10/2026. Đây là mô tả triển khai hiện tại, thay thế các đường dẫn API giả định của tài liệu BT1.
1. Quy ước chung
- Backend Express mặc định tại http://localhost:3000; Vite proxy /api tới port 3000 khi phát triển.
- Body JSON có header Content-Type: application/json. Định danh trong database là BIGSERIAL; id gửi/nhận là số nguyên hợp lệ, không phải UUID.
- Riêng POST /api/merges yêu cầu Authorization: Bearer <JWT> và vai trò MANAGER. Các route customer/duplicates được cung cấp chưa gắn middleware JWT.
- Định dạng lỗi hiện tại không đồng nhất hoàn toàn: nhiều route trả { "error": "ERROR_CODE", "message": "..." }; một số route chỉ có error; lỗi 500 được chuyển qua middleware xử lý lỗi tập trung. Không mặc định mọi lỗi đều có error.code/`error.fields`.
- Lưu ý: cấu trúc dữ liệu cụ thể của các service (đặc biệt response scan, getById, merge) cần đối chiếu thêm service/repository nếu làm đặc tả trường đầy đủ.
2. Danh sách endpoint thực tế
HTTP	Endpoint	Mục đích	Thành công	Các mã lỗi tường minh ở route
POST	/api/auth/login	Đăng nhập username/password	200	400, 401, 500
GET	/api/customers	Danh sách khách hàng	200	500
GET	/api/customers?phone=...	Tra cứu theo số điện thoại	200	404, 500
GET	/api/customers/:id	Xem chi tiết khách hàng	200	404, 500
POST	/api/customers	Tạo khách hàng	201	400, 409, 500
PATCH	/api/customers/:id	Cập nhật khách hàng	200	404, 409, 500
DELETE	/api/customers/:id	Xóa mềm khách hàng (is_active=false)	200	404, 500
GET	/api/duplicates	Danh sách cặp nghi trùng	200	500
POST	/api/duplicates/scan	Quét phát hiện cặp nghi trùng	200	500
GET	/api/duplicates/:id	Xem cặp và so sánh	200	400, 404, 500
DELETE	/api/duplicates/:id	Xóa kết quả quét đang PENDING	200	400, 404, 409, 500
POST	/api/merges	Gộp hai khách hàng trong cặp	200	400, 401, 403, 404, 409, 500


3. Xác thực: POST /api/auth/login
Request ví dụ:
POST /api/auth/login
Content-Type: application/json
{ "username": "manager", "password": "<mat-khau-demo>" }
Response thành công (minh họa cấu trúc do auth.service.js trả về):
{
  "token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 7200,
  "user": {
    "user_id": 2,
    "full_name": "Tran Thi Binh",
    "username": "manager",
    "role": "MANAGER"
  }
}
- 400 – INVALID_LOGIN_DATA: thiếu/sai kiểu dữ liệu đầu vào.
- 401 – INVALID_CREDENTIALS: username hoặc mật khẩu không đúng.
- 500 – lỗi hệ thống qua error-handler.
4. Quản lý khách hàng
Tạo: POST /api/customers
{
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Ho Chi Minh City",
  "created_by": 1
}
Thành công HTTP 201, trả đối tượng khách hàng do service tạo. Lỗi: 400 INVALID_CUSTOMER_DATA; 409 PHONE_ALREADY_EXISTS. Quy tắc kiểm tra giá trị chi tiết nằm ở customer service.
Đọc danh sách/chi tiết/tìm kiếm
- GET /api/customers trả mảng khách hàng.
- GET /api/customers?phone=0901234567 trả đối tượng khách hàng nếu tìm thấy, 404 CUSTOMER_NOT_FOUND nếu không thấy.
- GET /api/customers/:id trả đối tượng khách hàng hoặc 404 CUSTOMER_NOT_FOUND.
Cập nhật/xóa mềm
- PATCH /api/customers/:id: gửi các thuộc tính cần cập nhật; thành công 200. Nếu trùng số điện thoại trả 409 PHONE_ALREADY_EXISTS; không tìm thấy trả 404.
- DELETE /api/customers/:id: thành công 200 với { "message": "CUSTOMER_DEACTIVATED", "customer": { ... } }; không xóa vật lý bản ghi.
5. Phát hiện và quản lý hồ sơ nghi trùng
- POST /api/duplicates/scan: quét khách hàng và trả kết quả của scanDuplicates(); HTTP 200.
- GET /api/duplicates: HTTP 200; trả danh sách các cặp từ service.
- GET /api/duplicates/:id: HTTP 200; dữ liệu chi tiết để màn hình so sánh hiển thị hai hồ sơ A/B. 400 INVALID_CANDIDATE_ID, 404 CANDIDATE_NOT_FOUND.
- DELETE /api/duplicates/:id: chỉ xóa cặp PENDING; HTTP 200 khi thành công, 409 CANDIDATE_ALREADY_PROCESSED nếu đã xử lý.
6. Gộp hồ sơ: POST /api/merges
Bảo vệ: middleware authenticate rồi requireManager; ID quản lý lấy từ req.user.user_id, không lấy manager_id do client tự khai báo.
POST /api/merges
Authorization: Bearer <JWT_MANAGER>
Content-Type: application/json
Body theo cách gọi thực tế từ màn hình DuplicateCompare.jsx:
{
  "candidate_id": 4,
  "primary_customer_id": 4,
  "manager_confirmed": true,
  "selected_data": {
    "full_name": "Nguyen Van Test",
    "phone": "0901111222",
    "email": "test.a@example.com",
    "address": "Ca Mau"
  }
}
Response HTTP 200: kết quả của mergeService.mergeCustomers() (màn hình dùng trường message nếu được cung cấp).

Các trường hợp lỗi được ánh xạ trong route:
HTTP	Mã	Ý nghĩa
400	MANAGER_CONFIRMATION_REQUIRED	Chưa xác nhận quản lý
400	INVALID_MANAGER_ID, INVALID_CUSTOMER_ID, INVALID_MERGE_DATA, INVALID_FULL_NAME, INVALID_PHONE, INVALID_PRIMARY_CUSTOMER	Đầu vào không hợp lệ
401	UNAUTHORIZED (hoặc lỗi xác thực từ middleware)	Thiếu/sai token
403	FORBIDDEN (hoặc lỗi phân quyền từ middleware)	Không có vai trò MANAGER
403	MANAGER_NOT_FOUND	Không có tài khoản quản lý hợp lệ
404	CANDIDATE_NOT_FOUND	Không tìm thấy cặp
409	CANDIDATE_ALREADY_PROCESSED, CUSTOMER_NOT_ACTIVE, PHONE_ALREADY_EXISTS	Cặp đã xử lý, khách hàng không hoạt động hoặc xung đột số điện thoại
500	INTERNAL_SERVER_ERROR	Lỗi không dự kiến


Quy tắc nghiệp vụ: không gộp cặp đã xử lý; hồ sơ chính còn hoạt động, hồ sơ phụ bị vô hiệu hóa và lịch sử gộp được lưu trong customer_merge trong transaction.
7. Minh chứng đã có và giới hạn
- npm test: 8/8 PASS (7 kiểm thử phát hiện trùng, 1 kiểm thử error-handler).
- Đăng nhập được cả SALES và MANAGER; SALES bị khóa nút gộp trên giao diện và từng nhận HTTP 403 khi gọi API; MANAGER gộp trên database thử nghiệm thành công.
- Cặp #4 chuyển MERGED, khách hàng #4 active, #5 inactive và customer_merge có một lịch sử gộp.
- Chạy migrations 001–003 và seeds 001–003 từ database trống thành công.
- Chưa chứng minh: rollback chủ động khi SQL lỗi giữa transaction; kiểm thử tự động đầu-cuối JWT; fresh clone nguyên repo từ GitHub.