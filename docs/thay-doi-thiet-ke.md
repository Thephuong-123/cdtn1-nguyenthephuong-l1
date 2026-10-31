Nhật ký thay đổi thiết kế
Sau phản hồi Bài tập 1
Ngày: 17/10/2026
TD-01 – Điều chỉnh số lượng User Story
- Phản hồi của GV:
  Bài có 8 User Story, vượt mức yêu cầu 5–7 User Story.
- Quyết định:
  SỬA.
- Lý do:
  Gộp chức năng cảnh báo hồ sơ nghi trùng vào User Story tạo hồ sơ khách hàng vì cảnh báo trùng xảy ra trong quá trình tạo hồ sơ.
- Ảnh hưởng:
  Giảm từ 8 User Story xuống còn 7 User Story.
  Cập nhật docs/srs.md, bảng truy vết, Use Case, ERD và Wireframe.
  US8 cũ được đổi thành US7.
TD-02 – Bổ sung vai trò Quản lý cửa hàng
- Phản hồi của GV:
  SRS chỉ có một vai trò Nhân viên bán hàng, trong khi yêu cầu cần ít nhất 2 vai trò.
- Quyết định:
  SỬA.
- Lý do:
  Quản lý cửa hàng tham gia xác nhận trước khi hệ thống thực hiện gộp hai hồ sơ khách hàng trùng.
- Ảnh hưởng:
  Bổ sung actor Quản lý cửa hàng vào SRS và Use Case Diagram.
  Cập nhật đặc tả UC7 và quy tắc nghiệp vụ BR4.
TD-03 – Bổ sung SQL DDL skeleton vào báo cáo
- Phản hồi của GV:
  Mục 4.2 chỉ mô tả cấu trúc dữ liệu và dẫn tới file SQL, chưa có câu lệnh CREATE TABLE trực tiếp trong báo cáo.
- Quyết định:
  SỬA.
- Lý do:
  Cần thể hiện trực tiếp cấu trúc bảng, khóa chính, khóa ngoại và các ràng buộc dữ liệu.
- Ảnh hưởng:
  Bổ sung SQL DDL cho các bảng:
  app_user, customer, duplicate_candidate, customer_merge.
TD-04 – Bổ sung chú thích cho các sơ đồ
- Phản hồi của GV:
  Use Case Diagram, Architecture và ERD chưa có chú thích ký hiệu.
- Quyết định:
  SỬA.
- Lý do:
  Chú thích giúp người đọc hiểu rõ ý nghĩa của actor, use case, include, các lớp kiến trúc, PK, FK và quan hệ dữ liệu.
- Ảnh hưởng:
  Cập nhật:
  docs/usecase.drawio,
  docs/architecture.drawio,
  docs/erd.drawio.
TD-05 – Điều chỉnh định dạng bài nộp
- Phản hồi của GV:
  Bài tập 1 được nộp dưới dạng DOCX trong khi yêu cầu là PDF.
- Quyết định:
  SỬA.
- Lý do:
  PDF giúp giữ nguyên bố cục và định dạng khi chấm bài.
- Ảnh hưởng:
  Các bài nộp tiếp theo sẽ được xuất đúng định dạng PDF trước khi nộp.
TD-06 – Giữ yêu cầu rollback khi gộp hồ sơ
- Phản hồi của GV:
  Nên kiểm thử NFR3 bằng cách cố ý gây lỗi giữa quá trình gộp và kiểm tra dữ liệu được rollback.
- Quyết định:
  GIỮ NGUYÊN NFR3 VÀ BỔ SUNG KIỂM THỬ.
- Lý do:
  Transaction và rollback là cần thiết để đảm bảo không tồn tại trạng thái gộp hồ sơ một phần.
- Ảnh hưởng:
  Giữ nguyên NFR3 và thiết kế MergeService.
  Ở giai đoạn kiểm thử sẽ bổ sung test gây lỗi giữa transaction và kiểm tra dữ liệu trong các bảng liên quan.
  PS C:\Users\PC\CDTN1\cdtn1-nguyenthephuong-l1>
Bổ sung sau triển khai Bài tập 2 – 31/10/2026
TD-07 – Chuyển xác nhận quản lý mô phỏng thành JWT và phân quyền thật
- Lý do: Trước đây giao diện chỉ có checkbox quản lý, bất kỳ vai trò nào cũng có thể nhìn thấy thao tác gộp.
- Thay đổi: Thêm đăng nhập POST /api/auth/login; JWT ký HS256, hạn 2 giờ; POST /api/merges yêu cầu Bearer JWT và vai trò MANAGER. manager_id do Backend lấy từ tài khoản xác thực thay vì tin vào số do giao diện gửi.
- Ảnh hưởng: Thêm Auth service/repository/middleware, màn hình đăng nhập, thông báo 401/403, nút gộp bị khóa với SALES. Các API khác hiện chưa gắn middleware xác thực; chưa coi là bảo vệ toàn bộ hệ thống.
- Minh chứng: Đăng nhập SALES/MANAGER; kiểm tra UI theo vai trò, API SALES nhận 403 và MANAGER thực hiện gộp thành công trên database thử nghiệm.
TD-08 – Mở rộng schema và seed tài khoản demo
- Lý do: Bổ sung username và mật khẩu băm để người khác tái lập môi trường.
- Thay đổi: 003_add_auth_columns.sql thêm username, password_hash và unique index; 003_auth_demo.sql gán username và bcrypt hash cho tài khoản demo đã seed.
- Ảnh hưởng: Khi cài mới cần chạy migrations 001–003 rồi seeds 001–003 theo đúng thứ tự. Mật khẩu seed chỉ dùng trong môi trường demo.
- Minh chứng: Fresh Database Test PASS trên mekong_mobile_l1_bt2_fresh (2 users, 5 customers, 1 candidate trước khi quét).
TD-09 – Đồng bộ API Contract với mã nguồn BT2
- Lý do: Tài liệu cũ mô tả POST /api/customers/merge, trong khi mã nguồn dùng POST /api/merges; các endpoint duplicates cũng thay đổi.
- Thay đổi: Cập nhật endpoint trong docs/api-contract.md theo route thực tế, bổ sung GET danh sách, DELETE (xóa mềm) khách hàng, quét/xem/xóa ứng viên trùng, login và mã lỗi.
- Ảnh hưởng: Không đổi quy tắc nghiệp vụ cốt lõi, thay đổi tài liệu tích hợp cho phù hợp mã nguồn.
TD-10 – Cải thiện kiểm thử và khả năng tái lập
- Lý do: Yêu cầu BT2 có cách khởi động đơn giản, lỗi tập trung, và minh chứng kiểm thử.
- Thay đổi: Thêm npm start/`npm run dev`; duy trì 8 unit tests; bổ sung hướng dẫn setup database bằng migration/seed và file scripts/setup-db.js.
- Minh chứng: npm test PASS 8/8; npm run lint và npm run build PASS; tạo database mới và chạy migration/seed thành công.
- Chưa hoàn tất: Chưa xác nhận fresh clone từ GitHub và chưa có test chủ động gây lỗi SQL giữa transaction để kiểm chứng rollback (TD-06).