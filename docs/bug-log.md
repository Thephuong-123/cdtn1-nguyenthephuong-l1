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
