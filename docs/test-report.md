# TEST REPORT – BÀI TẬP 3
## Track SE – Luồng L1: Quản lý và hợp nhất hồ sơ khách hàng

**Trạng thái:** Đã thực hiện kiểm thử BT3. Cả 12 test case chính trong báo cáo đều PASS. Bộ kiểm thử tự động phiên bản hiện tại đạt 17/17 PASS. Các kiểm thử tích hợp bổ sung xác nhận HTTP 401 khi chưa xác thực, HTTP 403 khi SALES cập nhật hồ sơ không thuộc quyền, dữ liệu không thay đổi sau yêu cầu bị từ chối và HTTP 200 khi MANAGER cập nhật hợp lệ.

**Phạm vi minh chứng:** Một số test case sử dụng mock, một số được kiểm chứng với PostgreSQL thật. Kết quả kiểm thử không đồng nghĩa đã hoàn thành đánh giá bảo mật toàn diện.

| Mã test | Tiền điều kiện | Các bước thực hiện | Dữ liệu thử | Kết quả mong đợi | Ưu tiên | Kết quả thực tế | PASS/FAIL |
|---|---|---|---|---|---|---|---|
| TC-01 | Repository giả trả về không tìm thấy SĐT; hàm tạo được mock | 1. Gọi createCustomer với dữ liệu hợp lệ 2. Kiểm tra đối tượng trả về | full_name=Nguyen Van Test; phone=0912345670; created_by=1 | Trả về customer_id=100 và phone=0912345670 | Cao | Nhận customer_id=100 và phone=0912345670 | PASS |
| TC-02 | Repository giả trả về khách hàng đã tồn tại | 1. Gọi createCustomer 2. Kiểm tra lỗi | phone=0912345670 | Ném PHONE_ALREADY_EXISTS; không gọi hàm tạo | Cao | Ném PHONE_ALREADY_EXISTS; không gọi hàm tạo | PASS |
| TC-03 | Repository giả không có SĐT đang thử | 1. Gọi createCustomer 2. Kiểm tra SĐT trả về | phone=0912345671, đủ 10 chữ số | Trả về phone=0912345671 | Cao | Trả về phone=0912345671 | PASS |
| TC-04 | Repository giả không có SĐT đang thử | 1. Gọi createCustomer với SĐT 9 chữ số 2. Kiểm tra lỗi | phone=091234567 | Ném INVALID_CUSTOMER_DATA | Cao | Trước sửa không ném lỗi (FAIL); sau sửa ném INVALID_CUSTOMER_DATA (PASS) | PASS |
| TC-05 | Hàm tạo repository được mock | 1. Gọi createCustomer với họ tên rỗng 2. Kiểm tra lỗi | full_name rỗng; phone=0912345670 | Ném INVALID_CUSTOMER_DATA; không gọi hàm tạo | Cao | Ném INVALID_CUSTOMER_DATA; không gọi hàm tạo | PASS |
| TC-06 | Repository được mock; dữ liệu tra cứu sai định dạng | 1. Gọi getCustomerByPhone 2. Kiểm tra lỗi 3. Kiểm tra repository không được gọi | phone=123 | Ném INVALID_CUSTOMER_DATA; không truy vấn repository | Cao | Trước sửa ném CUSTOMER_NOT_FOUND (FAIL); sau sửa ném INVALID_CUSTOMER_DATA và không gọi repository (PASS) | PASS |
| TC-07 | Hàm isPotentialDuplicate có sẵn; không kết nối database | 1. Chạy TC03, TC04, TC05 trong duplicate-detection.test.js 2. Kiểm tra kết quả | TC03: trùng email không phân biệt hoa thường; TC04: tên gần giống và SĐT gần giống; TC05: tên và địa chỉ tương đồng | Cả 3 trường hợp trả về true | Cao | Cả 3 trường hợp PASS, hàm trả về true như mong đợi | PASS |
| TC-08 | Pool.query và Merge Repository được mock; tài khoản MANAGER giả lập | 1. Gọi mergeCustomers 2. Kiểm tra dữ liệu truyền tới Repository 3. Kiểm tra kết quả | manager_id=2; candidate_id=1; primary_customer_id=10; selected_data gồm Nguyen Van An, 0912345670, an@example.com, Ca Mau | Repository nhận đúng ID và toàn bộ selected_data đã chọn | Cao | Đúng managerId=2, candidateId=1, primaryCustomerId=10, selectedData; TC-08 PASS | PASS |
| TC-09 | Express chạy cục bộ; JWT hợp lệ của SALES; truy vấn tài khoản được mock | 1. Tạo token SALES 2. POST /api/merges 3. Kiểm tra HTTP và số lần gọi Merge Service | role=SALES; manager_confirmed=true; candidate_id=1; primary_customer_id=10 | HTTP 403; error=FORBIDDEN; Merge Service không được gọi | Cao | HTTP 403; FORBIDDEN; Merge Service được gọi 0 lần | PASS |
| TC-10 | PostgreSQL 16.15; database mekong_mobile_l1_bt3_test; MANAGER #2; candidate #1 PENDING; customer #2 và #3 đang hoạt động | 1. Gọi mergeService.mergeCustomers 2. Kiểm tra hồ sơ sau gộp 3. Kiểm tra trạng thái candidate 4. Kiểm tra lịch sử gộp | manager_id=2; candidate_id=1; primary_customer_id=3; phone=0901234567; manager_confirmed=true | Hồ sơ #3 ACTIVE; hồ sơ #2 INACTIVE; candidate MERGED; tạo 1 lịch sử gộp | Cao | Gộp và COMMIT thành công trên PostgreSQL; cả 4 điều kiện đều đạt | PASS |
| TC-11 | PostgreSQL 16.15; database mekong_mobile_l1_bt3_test; khách hàng #4 và #5 ACTIVE; cặp nghi trùng PENDING | 1. Lưu trạng thái trước gộp 2. Gọi Merge Repository với manager_id không tồn tại 3. Xác nhận lỗi khóa ngoại 4. So sánh dữ liệu trước và sau ROLLBACK | customer_id=4,5; manager_id=999999999; phone=0901111222 | PostgreSQL phát sinh lỗi 23503; rollback giữ nguyên khách hàng, candidate và lịch sử | Cao | Lỗi 23503 xuất hiện; hai hồ sơ vẫn ACTIVE; candidate PENDING; lịch sử không tăng; dữ liệu trước và sau giống nhau | PASS |
| TC-12 | Database mekong_mobile_l1_bt3_test được tạo mới, PostgreSQL 16.15 | 1. Chạy 3 migration và 3 seed lần 1 2. Đếm bản ghi 4 bảng 3. Chạy lại toàn bộ lần 2 4. So sánh số lượng | db/migrations/001-003; db/seeds/001-003 | Không lỗi SQL; số lượng bản ghi không tăng sau lần 2 | Cao | Cả hai lần chạy thành công; số lượng trước/sau: app_user=2, customer=5, duplicate_candidate=1, customer_merge=0 | PASS |

## Minh chứng

Ảnh minh chứng TC-01 đến TC-12 đã được lưu trong `docs/screenshots/`.

Ảnh kiểm thử tích hợp bảo mật được lưu trong `docs/screenshots/bt3-security/`:
- `sales-forbidden-403.png`
- `manager-update-200.png`

Ảnh kiểm tra Docker được lưu trong `docs/screenshots/bt3-docker/`.


## BT3 – Additional Integration Security Verification (14 November 2026)

**Test environment:** Docker Compose, Node.js/Express, PostgreSQL 16, React frontend and Nginx.

**Test method:** Real HTTP requests against the running Docker application, using authenticated SALES and MANAGER accounts.

| Test ID | Scenario | Input / Preconditions | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-INT-01 | Unauthenticated customer access | GET `/api/customers` without JWT | HTTP 401 | HTTP 401 | PASS |
| SEC-INT-02 | SALES attempts to update another user's customer | SALES user_id=1; PATCH `/api/customers/6`; created_by=2 | HTTP 403 | HTTP 403 | PASS |
| SEC-INT-03 | Verify no unauthorized data change | Compare customer #6 before and after SEC-INT-02 | Customer data unchanged | JSON comparison returned True | PASS |
| SEC-INT-04 | MANAGER updates customer profile | Authenticated MANAGER; PATCH `/api/customers/6` using existing values | HTTP 200 | HTTP 200 | PASS |

### Evidence

- Backend automated tests: 17 passed, 0 failed.
- Frontend production build: successful.
- Docker services: backend, frontend and database healthy.
- Unauthorized modification was blocked without changing customer data.
- Authorized MANAGER request succeeded.

### Limitations

The automated authorization tests use mocked services and database access. The integration checks above use the running Docker application with PostgreSQL. DELETE authorization and concurrent updates have not yet been independently verified through real-database integration tests.

## Final Clean-clone Deployment Verification – 14 November 2026

**Tested Git revision:** `7a7a2fd`

**Test environment:** Independent Docker Compose project `bt3-final-verify`, with a fresh PostgreSQL volume.

| Verification | Actual Result | Status |
|---|---|---|
| Clone final revision from GitHub | Commit 7a7a2fd checked out | PASS |
| Build and start Docker Compose | Three services Healthy | PASS |
| Verify backend health | HTTP 200, status ok | PASS |
| Verify unauthenticated API access | HTTP 401 | PASS |
| Run automated tests in Docker | 17 passed, 0 failed | PASS |

**Conclusion:** The final tested revision can be built and started from a clean clone. Authentication enforcement and the automated test suite passed in the isolated environment.

**Limitation:** This verification does not establish that every frontend workflow or business operation has been tested end to end.