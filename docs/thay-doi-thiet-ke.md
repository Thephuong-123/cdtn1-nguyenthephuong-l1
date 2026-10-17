# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1
Ngày: 17/10/2026

### TD-01 – Điều chỉnh số lượng User Story

- Phản hồi của GV:
  Bài có 8 User Story, vượt mức yêu cầu 5–7 User Story.

- Quyết định:
  SỬA.

- Lý do:
  Gộp chức năng cảnh báo hồ sơ nghi trùng vào User Story tạo hồ sơ khách hàng vì cảnh báo trùng xảy ra trong quá trình tạo hồ sơ.

- Ảnh hưởng:
  Giảm từ 8 User Story xuống còn 7 User Story.
  Cập nhật `docs/srs.md`, bảng truy vết, Use Case, ERD và Wireframe.
  US8 cũ được đổi thành US7.

---

### TD-02 – Bổ sung vai trò Quản lý cửa hàng

- Phản hồi của GV:
  SRS chỉ có một vai trò Nhân viên bán hàng, trong khi yêu cầu cần ít nhất 2 vai trò.

- Quyết định:
  SỬA.

- Lý do:
  Quản lý cửa hàng tham gia xác nhận trước khi hệ thống thực hiện gộp hai hồ sơ khách hàng trùng.

- Ảnh hưởng:
  Bổ sung actor Quản lý cửa hàng vào SRS và Use Case Diagram.
  Cập nhật đặc tả UC7 và quy tắc nghiệp vụ BR4.

---

### TD-03 – Bổ sung SQL DDL skeleton vào báo cáo

- Phản hồi của GV:
  Mục 4.2 chỉ mô tả cấu trúc dữ liệu và dẫn tới file SQL, chưa có câu lệnh `CREATE TABLE` trực tiếp trong báo cáo.

- Quyết định:
  SỬA.

- Lý do:
  Cần thể hiện trực tiếp cấu trúc bảng, khóa chính, khóa ngoại và các ràng buộc dữ liệu.

- Ảnh hưởng:
  Bổ sung SQL DDL cho các bảng:
  `app_user`, `customer`, `duplicate_candidate`, `customer_merge`.

---

### TD-04 – Bổ sung chú thích cho các sơ đồ

- Phản hồi của GV:
  Use Case Diagram, Architecture và ERD chưa có chú thích ký hiệu.

- Quyết định:
  SỬA.

- Lý do:
  Chú thích giúp người đọc hiểu rõ ý nghĩa của actor, use case, include, các lớp kiến trúc, PK, FK và quan hệ dữ liệu.

- Ảnh hưởng:
  Cập nhật:
  `docs/usecase.drawio`,
  `docs/architecture.drawio`,
  `docs/erd.drawio`.

---

### TD-05 – Điều chỉnh định dạng bài nộp

- Phản hồi của GV:
  Bài tập 1 được nộp dưới dạng DOCX trong khi yêu cầu là PDF.

- Quyết định:
  SỬA.

- Lý do:
  PDF giúp giữ nguyên bố cục và định dạng khi chấm bài.

- Ảnh hưởng:
  Các bài nộp tiếp theo sẽ được xuất đúng định dạng PDF trước khi nộp.

---

### TD-06 – Giữ yêu cầu rollback khi gộp hồ sơ

- Phản hồi của GV:
  Nên kiểm thử NFR3 bằng cách cố ý gây lỗi giữa quá trình gộp và kiểm tra dữ liệu được rollback.

- Quyết định:
  GIỮ NGUYÊN NFR3 VÀ BỔ SUNG KIỂM THỬ.

- Lý do:
  Transaction và rollback là cần thiết để đảm bảo không tồn tại trạng thái gộp hồ sơ một phần.

- Ảnh hưởng:
  Giữ nguyên NFR3 và thiết kế MergeService.
  Ở giai đoạn kiểm thử sẽ bổ sung test gây lỗi giữa transaction và kiểm tra dữ liệu trong các bảng liên quan.