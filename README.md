# Quản lý và hợp nhất hồ sơ khách hàng trùng lặp

**Sinh viên:** Nguyễn Thế Phương  
**MSSV:** 2374802010405  
**Track:** SE – Luồng L1  
**Học phần:** Chuyên đề Tốt nghiệp 1 – HK1 2026–2027

## 1. Mục tiêu

Xây dựng hệ thống Mekong Mobile CRM hỗ trợ quản lý hồ sơ khách hàng, tự động phát hiện hồ sơ nghi trùng, so sánh và hợp nhất thông tin nhằm hạn chế dữ liệu trùng lặp.

Hệ thống được phát triển theo kiến trúc phân lớp và có giao diện web để thao tác với dữ liệu thực tế trong PostgreSQL.

## 2. Công nghệ sử dụng

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL 16
- **Kiểm thử:** Node.js Test Runner
- **Quản lý mã nguồn:** Git, GitHub

**Yêu cầu môi trường:** Node.js 24, npm và PostgreSQL 16.

## 3. Hướng dẫn cài đặt và chạy

### Bước 1: Clone dự án

```powershell
git clone https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1.git
cd cdtn1-nguyenthephuong-l1
```

### Bước 2: Cài đặt thư viện

Cài đặt thư viện Backend:

```powershell
npm install
```

Cài đặt thư viện Frontend:

```powershell
cd frontend
npm install
cd ..
```

### Bước 3: Tạo database PostgreSQL

Mở SQL Shell (psql), đăng nhập PostgreSQL và tạo database:

```sql
CREATE DATABASE mekong_mobile_l1;
```

Chuyển sang database vừa tạo:

```sql
\c mekong_mobile_l1
```

Kiểm tra database đang sử dụng:

```sql
SELECT current_database();
```

Kết quả cần là `mekong_mobile_l1`.

### Bước 4: Chạy Migration

Trong SQL Shell, thay `<DUONG_DAN_DU_AN>` bằng đường dẫn tuyệt đối đến thư mục dự án trên máy.

Chạy Migration 001 để tạo bốn bảng:

```sql
\i '<DUONG_DAN_DU_AN>/db/migrations/001_create_tables.sql'
```

Chạy Migration 002 để thiết lập số điện thoại duy nhất đối với hồ sơ đang hoạt động:

```sql
\i '<DUONG_DAN_DU_AN>/db/migrations/002_active_phone_index.sql'
```

Ví dụ trên Windows:

```sql
\i 'C:/Users/PC/CDTN1/cdtn1-nguyenthephuong-l1/db/migrations/001_create_tables.sql'
```

**Lưu ý:** Chỉ chạy các migration khởi tạo một lần trên database mới. Không chạy lại `001_create_tables.sql` trên database đã có bảng.

### Bước 5: Nạp dữ liệu mẫu

Chạy file seed cơ bản:

```sql
\i '<DUONG_DAN_DU_AN>/db/seeds/001_seed_data.sql'
```

Chạy file seed phục vụ demo phát hiện hồ sơ nghi trùng:

```sql
\i '<DUONG_DAN_DU_AN>/db/seeds/002_duplicate_demo.sql'
```

Hai file seed tạo tổng cộng **5 khách hàng mẫu và 2 người dùng**.

Kiểm tra:

```sql
SELECT COUNT(*) AS total_customers FROM customer;
```

Kết quả mong đợi: `5`.

Dữ liệu trong các file seed là dữ liệu minh họa phục vụ kiểm thử, không phải dữ liệu khách hàng thực tế.

### Bước 6: Cấu hình môi trường

Tại thư mục gốc dự án, tạo file `.env` dựa trên `.env.example`.

Điền các thông tin kết nối PostgreSQL theo cấu hình máy cá nhân.

Đảm bảo cấu hình trỏ đến database vừa tạo:

```dotenv
DB_NAME=mekong_mobile_l1
```

Không đưa file `.env` chứa thông tin đăng nhập lên GitHub.

### Bước 7: Khởi động Backend

Tại thư mục gốc dự án:

```powershell
node src/index.js
```

Backend chạy tại:

http://localhost:3000

Kiểm tra kết nối:

```powershell
curl.exe http://localhost:3000/health
```

Kiểm tra API khách hàng:

```powershell
curl.exe http://localhost:3000/api/customers
```

### Bước 8: Khởi động Frontend

Mở một terminal khác:

```powershell
cd frontend
npm run dev
```

Truy cập giao diện:

http://localhost:5173

Các chức năng có thể thao tác gồm quản lý khách hàng, phát hiện hồ sơ nghi trùng, so sánh và gộp hồ sơ.

## 4. Cấu trúc dự án

```text
cdtn1-nguyenthephuong-l1/
├── db/
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   └── 002_active_phone_index.sql
│   └── seeds/
│       ├── 001_seed_data.sql
│       └── 002_duplicate_demo.sql
├── docs/
├── frontend/
├── src/
│   ├── config/
│   ├── repositories/
│   ├── services/
│   ├── routes/
│   └── index.js
├── tests/
├── .env.example
├── package.json
└── README.md
```

Backend được tổ chức theo kiến trúc:

**Routes → Services → Repositories → PostgreSQL**

## 5. Kiểm thử

### 5.1. Unit Tests

Chạy tại thư mục gốc:

```powershell
node --test tests/duplicate-detection.test.js
```

**Kết quả đã kiểm thử:** 7 PASS, 0 FAIL.

Các trường hợp bao gồm chuẩn hóa tên, phát hiện trùng email, tên và số điện thoại gần giống, phát hiện trùng theo tên và địa chỉ, trường hợp không trùng và dữ liệu thiếu.

### 5.2. Kiểm thử database mới

Đã tạo database thử nghiệm độc lập `mekong_mobile_l1_test` và chạy thành công:

- Migration 001 và 002.
- Seed 001 và 002.
- API đọc đúng 5 hồ sơ khách hàng.

Kết quả cho thấy có thể tái tạo cấu trúc database và dữ liệu mẫu từ các file SQL trong dự án.

### 5.3. Kiểm thử gộp hồ sơ US7

Đã kiểm thử thành công thao tác gộp hồ sơ trên database thử nghiệm:

- Hồ sơ chính #5 tiếp tục hoạt động (`is_active = true`).
- Hồ sơ phụ #4 được vô hiệu hóa (`is_active = false`).
- Bảng `customer_merge` ghi nhận 1 giao dịch gộp.
- Cặp nghi trùng được cập nhật trạng thái `MERGED`.

### 5.4. Kiểm thử ngoại lệ

Gửi lại yêu cầu gộp đối với cặp hồ sơ đã xử lý.

**Kết quả:** API trả về HTTP 409.

Kiểm tra PostgreSQL sau yêu cầu cho thấy trạng thái hai hồ sơ không thay đổi, tổng lịch sử gộp vẫn là 1 và cặp nghi trùng vẫn ở trạng thái `MERGED`.

Đây là kiểm thử xử lý xung đột nghiệp vụ. Chưa kiểm thử riêng tình huống lỗi SQL xảy ra giữa transaction để xác minh rollback.

## 6. Trạng thái chức năng

| Chức năng | Trạng thái |
|---|---|
| US1 – Tạo hồ sơ khách hàng | Hoàn thành |
| US2 – Tra cứu khách hàng | Hoàn thành |
| US3 – Xem chi tiết hồ sơ | Hoàn thành |
| US4 – Cập nhật hồ sơ | Hoàn thành |
| US5 – Tự phát hiện hồ sơ nghi trùng | Đã triển khai |
| US6 – So sánh hai hồ sơ | Hoàn thành |
| US7 – Gộp hồ sơ khách hàng | Đã kiểm thử thành công trên database thử nghiệm |
| Unit Tests | 7/7 PASS |

### Giới hạn hiện tại

- Xác nhận vai trò quản lý được mô phỏng trong bản demo localhost, chưa có cơ chế đăng nhập và xác thực hoàn chỉnh.
- Chưa có kiểm thử chuyên biệt để chứng minh rollback khi SQL gặp lỗi giữa transaction.
- Dữ liệu seed là dữ liệu minh họa, không phải dữ liệu khách hàng thực tế.
- Hệ thống hiện phục vụ mục đích học tập và kiểm thử cục bộ, chưa sẵn sàng triển khai công khai.

## 7. Minh chứng và GitHub

Các tài liệu thiết kế được lưu trong thư mục `docs/`, bao gồm SRS, API Contract, kiến trúc, ERD, Use Case và các hình ảnh minh chứng đã thực hiện.

**Repository:** https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1
