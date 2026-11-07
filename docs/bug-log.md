# BUG LOG – CDTN1 – Track SE – Luồng L1

## BUG-001 – Major: Migration/Seed lỗi khi chạy lần thứ hai

| Nội dung | Mô tả |
|---|---|
| **1. Mã và mức độ** | BUG-001 – Major. Quy trình dựng lại cơ sở dữ liệu không thể chạy lặp an toàn. |
| **2. Phát hiện bởi** | Phép thử C5 – Chạy lại Migration/Seed lần thứ hai trên database kiểm thử `mekong_mobile_l1_c5_test`. |
| **3. Triệu chứng** | Migration báo `relation "app_user" already exists`. Seed báo trùng số điện thoại `0901234567`. Số bản ghi `app_user` tăng từ 2 lên 4. |
| **4. Cách tái lập** | Tạo database kiểm thử mới, chạy lần lượt Migration 001, Migration 002, Seed 001 và Seed 002. Sau đó chạy lại Migration 001 và Seed 001 trên cùng database. |
| **5. Nguyên nhân** | Migration 001 tạo bảng/chỉ mục mà không kiểm tra sự tồn tại. Seed 001 INSERT trực tiếp, không kiểm tra trùng và không dùng transaction, dẫn đến dữ liệu được thêm một phần trước khi gặp lỗi. |
| **6. Cách sửa** | Bổ sung `IF NOT EXISTS` cho các lệnh tạo bảng/chỉ mục trong Migration 001. Bổ sung transaction và kiểm tra tồn tại trước khi INSERT trong Seed 001 và Seed 002, giữ nguyên dữ liệu mẫu và các quy tắc nghiệp vụ. |
| **7. Commit và xác nhận** | **Commit:** [63e179d](https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1/commit/63e179d) – `fix(db): make migrations and seed data idempotent`. **Xác nhận:** Chạy toàn bộ 4 file SQL hai lần trên database `mekong_mobile_l1_c5_final`, không lỗi. Số bản ghi giữ nguyên: 2 nhân viên, 5 khách hàng, 1 cặp nghi trùng. |

## BUG-002 – Major: Cho phép tạo khách hàng có số điện thoại sai định dạng

| Nội dung | Mô tả |
|---|---|
| **1. Mã và mức độ** | BUG-002 – Major. Chức năng tạo khách hàng không từ chối số điện thoại có 9 chữ số, vi phạm BR2 trong SRS. |
| **2. Phát hiện bởi** | BT3-TC-04 – Từ chối số điện thoại chỉ có 9 chữ số. |
| **3. Triệu chứng** | Trước khi sửa, test TC-04 FAIL với thông báo `Missing expected rejection`. Service không từ chối số điện thoại `091234567`. |
| **4. Cách tái lập** | Chạy `node --test tests/bt3-customer.test.js` trên phiên bản trước khi sửa. TC-04 gọi `createCustomer()` với `phone = 091234567` và repository giả; service không phát sinh lỗi `INVALID_CUSTOMER_DATA` như mong đợi. |
| **5. Nguyên nhân** | Hàm `createCustomer()` trong `src/services/customer.service.js` chỉ kiểm tra trường `phone` có giá trị, chưa kiểm tra định dạng đúng 10 chữ số và bắt đầu bằng 0. |
| **6. Cách sửa** | Bổ sung kiểm tra kiểu dữ liệu và biểu thức chính quy `^0\d{9}$` trong `createCustomer()`. Thêm test hồi quy TC-04 trong `tests/bt3-customer.test.js`. |
| **7. Commit và xác nhận** | [Commit 6d84792](https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1/commit/6d8479255ce8993219ebd05dd7524fbaa964b040). Sau sửa: TC-04 PASS; nhóm Customer 5/5 PASS; toàn bộ `npm test` 13/13 PASS. Minh chứng: `docs/screenshots/TC-04-before-fix.png`, `docs/screenshots/TC-04.png`, `docs/screenshots/BUG-002-fixed.png` (cần xác nhận các ảnh đã được lưu). |


## BUG-003 – Major: Tra cứu khách hàng không kiểm tra định dạng số điện thoại

| Nội dung | Mô tả |
|---|---|
| **1. Mã và mức độ** | BUG-003 – Major. Tra cứu số điện thoại sai định dạng không bị từ chối trước khi truy vấn. |
| **2. Phát hiện bởi** | BT3-TC-06 – Từ chối tra cứu số điện thoại không hợp lệ. |
| **3. Triệu chứng** | Với phone=123, Service trả CUSTOMER_NOT_FOUND thay vì INVALID_CUSTOMER_DATA. |
| **4. Cách tái lập** | Chạy node --test tests/bt3-lookup.test.js trên phiên bản trước sửa. TC-06 FAIL. |
| **5. Nguyên nhân** | Hàm getCustomerByPhone() gọi Repository trực tiếp mà không kiểm tra định dạng số điện thoại. |
| **6. Cách sửa** | Kiểm tra số điện thoại bằng biểu thức chính quy trong Service; bổ sung ánh xạ lỗi INVALID_CUSTOMER_DATA thành HTTP 400 tại Route. |
| **7. Commit và xác nhận** | [Commit BUG-003](https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1/commit/109f539eb6a8e4538adaa98ecaf123e8e1e4f20f). TC-06 PASS; npm test đạt 14/14 PASS. Minh chứng: docs/screenshots/TC-06-before-fix.png, TC-06.png và BUG-003-fixed.png. |
