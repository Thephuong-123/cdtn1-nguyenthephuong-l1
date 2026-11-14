# BẢNG KHAI BÁO SỬ DỤNG CÔNG CỤ AI HỖ TRỢ

**Học phần:** Chuyên đề Tốt nghiệp 1 (Specialized Graduation Topic I)
**Học kỳ:** HK1, Năm học 2026–2027
**Bài nộp:** [ ] Bài tập 1 (BT1)  [ ] Bài tập 2 (BT2)  [x] Bài tập 3 (BT3)

---

## I. THÔNG TIN SINH VIÊN

- **Họ và tên:** Nguyễn Thế Phương
- **Mã số sinh viên:** 2374802010405
- **Chuyên ngành (Track):** [x] SE  [ ] DA  [ ] AI
- **Luồng nghiệp vụ đã chọn:** L1 – Quản lý và hợp nhất hồ sơ khách hàng (Smart CRM – Mekong Mobile)

---

## II. KHAI BÁO SỬ DỤNG AI TRONG GIAI ĐOẠN BAN ĐẦU (BT1)

| Công cụ AI | Hoạt động AI hỗ trợ | File/phần liên quan | Cách sinh viên kiểm chứng và chỉnh sửa |
|---|---|---|---|
| ChatGPT | Giải thích yêu cầu Buổi 2 và Case Study Smart CRM, hỗ trợ xác định phạm vi luồng L1. | Phiếu phạm vi Buổi 2, mục 1–5. | Đối chiếu tài liệu học phần và giới hạn phạm vi vào tạo, tra cứu, phát hiện nghi trùng và hợp nhất hồ sơ. |
| ChatGPT | Hỗ trợ rà soát, diễn đạt User Story, INVEST, MoSCoW và tiêu chí chấp nhận Given–When–Then. | Phiếu phạm vi, `docs/srs.md`. | Rà soát các User Story, các yêu cầu chức năng và quy tắc nghiệp vụ theo phạm vi L1. |
| ChatGPT | Hướng dẫn tạo repository, `.gitignore`, `.env.example`, README và cấu trúc thư mục. | Repository, `.gitignore`, `.env.example`, `README.md`, `docs/`, `src/`, `tests/`. | Tự thực hiện lệnh Git, xem `git status`, xác nhận repository có trên GitHub và tránh commit `node_modules/`. |
| ChatGPT | Hướng dẫn khởi tạo Express, tạo và kiểm thử endpoint `/health`. | `package.json`, `package-lock.json`, `src/index.js`. | Chạy ứng dụng cục bộ, xác nhận phản hồi `{"status":"ok"}`; lưu minh chứng tại `docs/smoke-test-health.png`. |
| ChatGPT | Hỗ trợ cài đặt, cấu hình PostgreSQL và khắc phục lỗi môi trường Git/GitHub/database. | Môi trường phát triển, cơ sở dữ liệu `mekong_mobile_l1`. | Kiểm tra kết nối PostgreSQL và chạy lại các lệnh sau khi khắc phục lỗi. |
| ChatGPT | Hỗ trợ xây dựng và rà soát Use Case, SRS, API Contract, ERD, SQL DDL, Architecture và Wireframe. | `docs/srs.md`, `docs/usecase.drawio`, `docs/api-contract.md`, `docs/erd.drawio`, `docs/architecture.drawio`, `docs/wireframe.drawio`, `db/schema.sql`. | Đối chiếu các yêu cầu với sơ đồ, bảng dữ liệu và các tài liệu thiết kế; kiểm tra tính nhất quán của PK, FK, ràng buộc và nghiệp vụ. |
| ChatGPT | Hỗ trợ rà soát hồ sơ tài liệu BT1 trước khi nộp. | Các tài liệu BT1 trong repository. | Mở và kiểm tra nội dung, phạm vi và sự nhất quán của các sản phẩm đã tạo. |

---

## III. BỔ SUNG KHAI BÁO SỬ DỤNG AI – BÀI TẬP 2 (BT2)

| Công cụ AI | Hoạt động AI hỗ trợ | File/phần liên quan | Cách sinh viên kiểm chứng và chỉnh sửa |
|---|---|---|---|
| ChatGPT | Hướng dẫn bổ sung đăng nhập bằng username/password, bcrypt và JWT; phân quyền SALES/MANAGER cho nghiệp vụ gộp. | `src/routes/auth.routes.js`, `src/services/auth.service.js`, `src/repositories/auth.repository.js`, `src/middleware/auth.middleware.js`, `src/routes/merge.routes.js`, `db/migrations/003_add_auth_columns.sql`. | Thực hiện đăng nhập theo vai trò, đối chiếu phản hồi HTTP trong quá trình phát triển. |
| ChatGPT | Hỗ trợ kết nối frontend React với API đăng nhập, xử lý lỗi build/lint và hiển thị chức năng theo vai trò. | `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/api/auth.api.js`, các trang CustomerList, DuplicateList và DuplicateCompare. | Chạy lint/build ở các giai đoạn phát triển, đăng nhập hai vai trò và kiểm tra chức năng gộp. |
| ChatGPT | Hướng dẫn migrations/seeds, dữ liệu đăng nhập demo có bcrypt và kiểm tra database trống. | `db/migrations/003_add_auth_columns.sql`, `db/seeds/003_auth_demo.sql`, `scripts/setup-db.js`. | Đã kiểm tra chạy migrations/seeds với database thử nghiệm và xác nhận hai tài khoản demo; tại thời điểm khai báo BT2, script `setup-db.js` mới được kiểm tra cú pháp. |
| ChatGPT | Hỗ trợ rà soát REST API, dịch vụ gộp, truy vấn PostgreSQL và tài liệu kỹ thuật. | Routes, services, repositories, `docs/api-contract.md`, `docs/thay-doi-thiet-ke.md`, `README.md`. | Thử nghiệp vụ gộp trên database kiểm thử; đối chiếu trạng thái hồ sơ và lịch sử gộp sau giao dịch. |
| ChatGPT | Hỗ trợ thiết kế kịch bản và giải thích kết quả kiểm thử giai đoạn BT2. | `tests/duplicate-detection.test.js`, `tests/error-handler.test.js`. | Ghi nhận bộ kiểm thử ở thời điểm BT2 đạt 8/8 PASS; đây là kết quả lịch sử, không phải số lượng kiểm thử hiện tại. |

---

## IV. BỔ SUNG KHAI BÁO SỬ DỤNG AI – BÀI TẬP 3 (BT3)

| Công cụ AI | Hoạt động AI hỗ trợ | File/phần liên quan | Cách sinh viên kiểm chứng và trách nhiệm |
|---|---|---|---|
| ChatGPT | Hỗ trợ thiết kế Test Plan, test case, đọc kết quả và biên soạn Test Report. | `docs/test-plan.md`, `docs/test-report.md`, `tests/`. | Sinh viên chạy kiểm thử, ghi nhận 12 test case chính và lưu ảnh TC-01 đến TC-12; kết quả từng case được ghi trong Test Report. |
| ChatGPT | Hỗ trợ phân tích lỗi, đề xuất sửa validation và xử lý migration/seed chạy lặp; hướng dẫn ghi Bug Log và kiểm thử hồi quy. | `docs/bug-log.md`, `src/services/customer.service.js`, `db/migrations/`, `db/seeds/`, các file test liên quan. | Sinh viên thực hiện thay đổi, chạy lại kiểm thử và lưu minh chứng bug. Các commit và kết quả sửa lỗi được liệt kê tại Bug Log. |
| ChatGPT | Hỗ trợ cấu hình Dockerfile, Docker Compose, healthcheck, môi trường demo và hướng dẫn triển khai từ clean clone. | `Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `.env.example`, `docs/deployment-guide.md`, `docs/screenshots/bt3-docker/`. | Sinh viên chạy Docker Compose và xác nhận ba container Healthy; đã thử clean clone độc lập trước khi bổ sung test phân quyền mới. Cần kiểm tra lại clean clone trên phiên bản Git cuối. |
| ChatGPT | Hỗ trợ bổ sung JWT cho Customer/Duplicate API; xây dựng middleware kiểm tra quyền sở hữu hồ sơ theo vai trò SALES/MANAGER. | `src/routes/customer.routes.js`, `src/routes/duplicate.routes.js`, `src/middleware/customer-authorization.middleware.js`. | Sinh viên kiểm tra cú pháp, chạy test và thực hiện yêu cầu HTTP thực tế trên môi trường Docker. |
| ChatGPT | Hỗ trợ chỉnh giao diện, ẩn nút sửa khi người dùng không có quyền. | `frontend/src/pages/CustomerList.jsx`. | Sinh viên đã chạy `npm run build` thành công; việc kiểm tra hiển thị nút theo hai vai trò cần được đối chiếu riêng với kết quả thao tác giao diện đã thực hiện. |
| ChatGPT | Hỗ trợ viết test phân quyền và hướng dẫn kiểm tra cập nhật trái quyền bằng JWT trên backend thật. | `tests/bt3-customer-authorization.test.js`, `docs/screenshots/bt3-security/`. | Sinh viên chạy `npm test` đạt **17/17 PASS**; kiểm tra SALES sửa hồ sơ người khác nhận HTTP **403**, dữ liệu trước/sau không đổi; MANAGER cập nhật nhận HTTP **200**. Kiểm thử tự động phân quyền có sử dụng mock. |
| ChatGPT | Hỗ trợ biên soạn, rà soát tài liệu API bằng tiếng Anh, request/response mẫu và quy tắc xác thực. | `docs/api-documentation-bt3.md`. | Sinh viên lưu tài liệu và kiểm tra các mục quan trọng. Những response mẫu chưa được thử trực tiếp chỉ mang tính minh họa, không được tính là kết quả kiểm thử. |
| ChatGPT | Hỗ trợ cập nhật Deployment Guide, diễn giải các kết quả 401/403/200 và phân biệt minh chứng clean clone cũ với test mới. | `docs/deployment-guide.md`, `docs/test-report.md`, `docs/screenshots/`. | Sinh viên kiểm tra nội dung file bằng PowerShell, xác nhận các ảnh và kết quả kiểm thử hiện có. |
| ChatGPT | Hỗ trợ phát hiện chỗ chưa thống nhất giữa SRS, Test Plan, Test Report và chính sách phân quyền đã triển khai. | `docs/srs.md`, `docs/test-plan.md`, `docs/test-report.md`, `docs/ai-disclosure.md`. | Sinh viên cần đối chiếu và hoàn thiện các điểm khác nhau trước khi chốt bản nộp. AI không thay thế việc xác nhận yêu cầu với giảng viên. |

### Giới hạn kiểm chứng tại thời điểm khai báo BT3

- Bộ test tự động mới nhất trên máy phát triển đạt **17 PASS, 0 FAIL**; một số bài sử dụng mock thay vì PostgreSQL thật.
- Kiểm thử HTTP thực tế đã chứng minh trường hợp SALES sửa trái quyền bị từ chối (`403`) và dữ liệu không đổi; MANAGER cập nhật hợp lệ (`200`); yêu cầu chưa có JWT bị từ chối (`401`).
- Kiểm thử quyền xóa hồ sơ với cơ sở dữ liệu thật, kiểm thử tải và kiểm thử đồng thời chưa được xác nhận đầy đủ.
- Minh chứng clean clone ban đầu có **16 test PASS** và được tạo trước khi bổ sung bài kiểm thử phân quyền. Chưa kết luận bản Git cuối và release `v1.0` đã được kiểm chứng nếu chưa chạy lại.
- Các số liệu kiểm thử được trình bày theo đúng thời điểm thực hiện; không đồng nhất kết quả lịch sử BT1/BT2 với kết quả mới nhất của BT3.

---

## V. CAM KẾT VỀ LIÊM CHÍNH HỌC THUẬT

> Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp. Tôi khai báo các công việc có sử dụng công cụ AI hỗ trợ; tự rà soát mã nguồn, thao tác kiểm thử và đối chiếu kết quả với yêu cầu học phần. Những phần chưa được kiểm chứng được ghi rõ, không trình bày như kết quả đã thực hiện.

- **Họ tên sinh viên:** Nguyễn Thế Phương
- **MSSV:** 2374802010405
- **Ngày khai báo ban đầu:** 09/10/2026
- **Bổ sung BT2:** 31/10/2026
- **Cập nhật BT3:** 14/11/2026
