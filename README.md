# Quản lý và hợp nhất hồ sơ khách hàng trùng lặp

Sinh viên: Nguyễn Thế Phương  
MSSV: 2374802010405  
Track: SE  

Học phần: Chuyên đề Tốt nghiệp 1, HK1 2026-2027

Luồng nghiệp vụ:  
L1 – Hồ sơ khách hàng & phân khúc

## 1. Mục tiêu

Xây dựng module hỗ trợ nhân viên bán hàng quản lý hồ sơ khách hàng.
Hệ thống cho phép tạo, tra cứu và xem thông tin khách hàng.
Đồng thời hỗ trợ phát hiện và gộp các hồ sơ khách hàng bị trùng,
giúp dữ liệu khách hàng được thống nhất.

## 2. Yêu cầu môi trường

- Node.js
- Express.js
- PostgreSQL
- Git
- GitHub
- Biến môi trường: xem `.env.example`

- Node.js 24
- npm
- PostgreSQL 16
- Biến môi trường: xem file `.env.example`
- Cổng mặc định: 3000
- Cơ sở dữ liệu: `mekong_mobile_l1`

Các package chính:
- express
- pg
- dotenv

## 3. Hướng dẫn chạy

Sẽ cập nhật trong quá trình phát triển.

## 4. Cấu trúc thư mục

Sẽ cập nhật trong quá trình phát triển.

## 5. Kiểm thử

Sẽ cập nhật trong quá trình phát triển.

## 6. Trạng thái hiện tại

- [x] Chốt phạm vi L1
- [x] Khởi tạo Git repository
- [x] Khởi tạo Node.js project
- [x] Smoke test endpoint `/health`
- [x] Khởi tạo PostgreSQL và database `mekong_mobile_l1`
- [ ] Module quản lý hồ sơ khách hàng
- [ ] Module phát hiện và gộp hồ sơ trùng

### Buổi 8 – Workshop xây dựng module cốt lõi Sprint 1

- [x] Đã đọc và xử lý phản hồi Bài tập 1
- [x] Đã tạo `docs/thay-doi-thiet-ke.md`
- [x] Đã dựng cấu trúc mã nguồn theo kiến trúc 3 lớp:
  - `routes/`
  - `services/`
  - `repositories/`
- [x] Đã kết nối PostgreSQL
- [x] Đã tạo migration theo DDL của BT1
- [x] Đã nạp dữ liệu seed mẫu
- [x] Đã hiện thực CRUD cho entity `customer`
- [x] Đã chạy thành công:
  - `GET /health`
  - `GET /api/customers`
  - `GET /api/customers?phone=...`
- [x] Đã lưu ảnh minh chứng tại `docs/customer-module-success.png`

### Chưa hoàn thành

- [ ] Hoàn thiện module phát hiện hồ sơ nghi trùng
- [ ] Hiện thực chức năng gộp hồ sơ
- [ ] Bổ sung unit test cho lớp nghiệp vụ