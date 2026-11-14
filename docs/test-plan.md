# TEST PLAN – BÀI TẬP 3 (BT3)
## Track SE – Luồng L1: Quản lý và hợp nhất hồ sơ khách hàng

**Dự án:** Mekong Mobile CRM
**Ngày rà soát:** 14/11/2026
**Tài liệu đối chiếu:** `docs/srs.md`, `docs/test-report.md`, `docs/bug-log.md`, các bài kiểm thử trong `tests/`.

## 1. Phạm vi kiểm thử

**Trong phạm vi:**
- Tạo, tra cứu, xem, cập nhật và vô hiệu hóa hồ sơ khách hàng; kiểm tra dữ liệu và số điện thoại.
- Phát hiện, xem và so sánh các hồ sơ nghi trùng; xử lý gộp khi được MANAGER xác nhận.
- Xác thực JWT; phân quyền SALES/MANAGER; kiểm soát quyền cập nhật theo `created_by`.
- Kiểm tra toàn vẹn transaction/ROLLBACK khi gộp hồ sơ.
- Kiểm tra khả năng chạy lặp migrations/seeds và triển khai Docker Compose.
- Đối chiếu các quy tắc nghiệp vụ BR1–BR7 với phạm vi minh chứng hiện có.

**Ngoài phạm vi:**
- Phân khúc khách hàng, marketing, bán hàng, bảo hành, kho.
- Kiểm thử tải ở quy mô 10.000 hồ sơ, đo NFR thời gian phản hồi, thử nghiệm khả dụng có người dùng thật.
- Kiểm toán bảo mật toàn diện, kiểm thử đồng thời và kiểm thử xâm nhập chuyên sâu.

## 2. Thiết kế và phân loại test case

### 2.1. Mười hai test case chính trong Test Report

Phân loại theo **cách thực thi thực tế** thay vì giữ tỷ lệ kế hoạch 6 unit / 3 integration / 3 API ban đầu:

| Nhóm | Số lượng | Mã test | Phương pháp |
|---|---:|---|---|
| Unit/service với mock hoặc hàm độc lập | 8 | TC-01 đến TC-08 | Kiểm tra validation, tra cứu, phát hiện nghi trùng, dữ liệu gộp; không xác minh PostgreSQL thật trong các case này |
| API với Express/JWT và dependency mock | 1 | TC-09 | Gửi HTTP đến Express chạy cục bộ, kiểm tra SALES bị từ chối gộp |
| Tích hợp PostgreSQL thật | 3 | TC-10 đến TC-12 | Kiểm tra gộp/COMMIT, rollback khi lỗi, migrations/seeds chạy lặp |
| **Tổng** | **12** | **TC-01 đến TC-12** | Xem kết quả và điều kiện cụ thể tại `docs/test-report.md` |

**Lưu ý:** TC-07 tổng hợp các tình huống kiểm tra phát hiện trùng bằng hàm độc lập. Việc có 12 test case trong báo cáo không đồng nghĩa lệnh `npm test` chạy đúng 12 bài. Bộ kiểm thử tự động ở phiên bản hiện tại báo **17/17 PASS**, bao gồm các bài có tên khác và một bài tự động phân quyền với nhiều trường hợp kiểm tra.

### 2.2. Kiểm thử bảo mật tích hợp bổ sung (ngoài 12 case chính)

| Mã | Tình huống | Kết quả quan sát |
|---|---|---|
| SEC-INT-01 | GET `/api/customers` không gửi JWT | HTTP 401 |
| SEC-INT-02 | SALES (user_id=1) PATCH hồ sơ #6 do user_id=2 tạo | HTTP 403 |
| SEC-INT-03 | Đọc hồ sơ #6 trước và sau yêu cầu bị từ chối | Dữ liệu so sánh không thay đổi |
| SEC-INT-04 | MANAGER PATCH hồ sơ #6 bằng dữ liệu hiện tại | HTTP 200 |

Bốn tình huống trên đã được ghi trong `docs/test-report.md` và chạy trên ứng dụng Docker kết nối PostgreSQL. SEC-INT-04 là thao tác ghi thật, có thể làm mới trường `updated_at`. Các kiểm thử này không được tính thêm vào **12 test case chính**.

### 2.3. Kỹ thuật và nhóm kiểm thử

- **Luồng hợp lệ:** tạo khách hàng, xử lý gộp và cập nhật đúng quyền.
- **Giá trị biên:** số điện thoại đủ 10 chữ số (TC-03) và thiếu một chữ số (TC-04).
- **Dữ liệu không hợp lệ:** thiếu họ tên (TC-05), tra cứu số điện thoại sai định dạng (TC-06), số điện thoại đã tồn tại (TC-02).
- **Bảo mật và chất lượng dữ liệu:** SALES bị chặn gộp (TC-09); kiểm tra 401/403 và bảo toàn dữ liệu (SEC-INT-01 đến 03).
- **Tính tái lập và toàn vẹn:** rollback (TC-11), chạy lặp migrations/seeds (TC-12).

### 2.4. Đối chiếu BR1–BR7 với bằng chứng

| Quy tắc | Bằng chứng hiện có | Mức độ xác minh |
|---|---|---|
| BR1 – Số điện thoại duy nhất | TC-02 | Có test từ chối tạo trùng với repository mock |
| BR2 – Số điện thoại 10 chữ số bắt đầu bằng 0 | TC-03, TC-04, TC-06 | Có test hợp lệ, giá trị biên và dữ liệu sai |
| BR3 – Hiển thị hồ sơ cũ thay vì tạo trùng | TC-02 chỉ chứng minh từ chối tạo trùng | **Chưa có bằng chứng riêng** về hiển thị hồ sơ cũ trên giao diện |
| BR4 – Quản lý xác nhận trước khi gộp | TC-09, TC-10 | Có kiểm tra từ chối SALES và gộp hợp lệ; cần đối chiếu lời văn SRS về người thực hiện |
| BR5 – Chọn thông tin xung đột | TC-08 | Có test truyền đúng `selected_data` bằng mock; chưa chứng minh toàn bộ thao tác UI |
| BR6 – Sử dụng hồ sơ chuẩn sau gộp | TC-10 | Có kiểm tra hồ sơ chính hoạt động, hồ sơ phụ ngừng hoạt động |
| BR7 – ROLLBACK khi gộp lỗi | TC-11 | Có kiểm tra PostgreSQL thật |

**Điểm chưa đạt đầy đủ:** Chưa được phép kết luận mọi BR1–BR7 đều có bằng chứng end-to-end. BR3 và một phần luồng giao diện FR5 cần được kiểm thử bổ sung hoặc ghi rõ là giới hạn trong báo cáo cuối.

## 3. Tiêu chí hoàn thành và báo cáo kết quả

- Có 12 test case chính được thực hiện, ghi đủ điều kiện, bước, dữ liệu, kết quả mong đợi, thực tế và PASS/FAIL trong `docs/test-report.md`.
- Minh chứng TC-01 đến TC-12 được lưu tại `docs/screenshots/`.
- Các bug thực tế có mô tả triệu chứng, nguyên nhân, cách sửa, kiểm thử lại và tham chiếu commit tại `docs/bug-log.md`.
- Chạy `npm test` không có bài FAIL; kết quả gần nhất **17 passed, 0 failed**.
- Xác thực JWT, quyền thao tác đối tượng và dữ liệu không đổi sau yêu cầu trái quyền có minh chứng riêng.
- Mọi khoảng trống kiểm thử và yêu cầu chưa đo đạc phải được ghi rõ; không gắn PASS cho một hành vi chưa kiểm chứng.
- Trước release, cần kiểm thử lại clean-clone từ **commit cuối** và lưu kết quả; không được dùng ảnh 16 test trước đó để khẳng định phiên bản cuối có 17 test.

## 4. Môi trường, dữ liệu thử và cách thực thi

**Môi trường phát triển:** Windows, Node.js/Express, React/Vite, PostgreSQL 16, Docker Desktop và Docker Compose.
**Công cụ:** `node:test`, `node:assert`, PowerShell (`Invoke-RestMethod`, `Invoke-WebRequest`), Docker Compose và `psql` khi cần.

**Kiểm thử tự động tại thư mục gốc:**

```powershell
npm test
```

**Kiểm thử bên trong container:**

```powershell
docker compose exec app npm test
```

**Đường dẫn triển khai demo:** `http://localhost:8080`; backend bên trong container nghe cổng 3000. Các API có bảo vệ phải gửi JWT. Để tránh lộ thông tin đăng nhập, không đưa mật khẩu hoặc token vào ảnh nộp.

**Quản lý dữ liệu:**
- Unit và API test có mock không ghi vào PostgreSQL thật.
- TC-10 đến TC-12 sử dụng database kiểm thử riêng được mô tả trong Test Report.
- Bốn SEC-INT đã được thực hiện trên database demo Docker đang chạy: thử cập nhật trái quyền bị chặn và kiểm tra dữ liệu trước/sau; thao tác MANAGER là cập nhật có quyền. **Không mô tả các bước này như kiểm thử trên database cô lập.**
- Các lần kiểm thử có ghi dữ liệu trong tương lai nên dùng hồ sơ thử và database độc lập, có kế hoạch khởi tạo/khôi phục dữ liệu.

**Vị trí minh chứng:**
- `docs/screenshots/TC-01.png` đến `TC-12.png`
- `docs/screenshots/bt3-security/`
- `docs/screenshots/bt3-docker/`

**Trạng thái tại 14/11/2026:** Mười hai test case chính đã ghi PASS trong Test Report, bộ test tự động 17/17 PASS và các tình huống SEC-INT-01 đến 04 đã được ghi nhận. Vẫn cần đối chiếu SRS, rà soát các trường hợp chưa có minh chứng và kiểm tra clean-clone phiên bản cuối.
