Mekong Mobile CRM – Quản lý và hợp nhất hồ sơ khách hàng
Sinh viên: Nguyễn Thế Phương
MSSV: 2374802010405
Track: SE – Luồng L1
Học phần: Chuyên đề Tốt nghiệp 1 – HK1 2026–2027
1. Tổng quan
Ứng dụng hỗ trợ quản lý hồ sơ khách hàng, phát hiện cặp hồ sơ nghi trùng, so sánh và hợp nhất dữ liệu. Hệ thống gồm giao diện React, API Express và cơ sở dữ liệu PostgreSQL.

Các chức năng chính: tạo, xem danh sách, tra cứu, xem chi tiết, cập nhật và vô hiệu hóa hồ sơ khách hàng qua API; quét, xem và xử lý cặp nghi trùng; so sánh hai hồ sơ và chọn dữ liệu giữ lại; gộp hồ sơ có ghi lịch sử; đăng nhập JWT và phân quyền SALES / MANAGER. Chỉ MANAGER được quyền gọi API gộp.
2. Công nghệ và yêu cầu
- Node.js 24, npm
- PostgreSQL 16
- Backend: Express.js, pg, jsonwebtoken, bcryptjs
- Frontend: React + Vite
- Kiểm thử: Node.js Test Runner và ESLint
3. Cài đặt từ GitHub trên Windows (PowerShell)
3.1. Clone và cài dependency
git clone https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1.git
cd cdtn1-nguyenthephuong-l1
npm ci
cd frontend
npm ci
cd ..
3.2. Tạo .env
Copy-Item .env.example .env
Chỉnh .env (không đưa file này lên GitHub):
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mekong_mobile_l1_bt2_local
DB_USER=postgres
DB_PASSWORD=MAT_KHAU_POSTGRESQL_CUA_BAN
JWT_SECRET=THAY_BANG_CHUOI_BI_MAT_NGAU_NHIEN_DU_DAI
PORT=3000
- DB_NAME nên là tên database mới, chưa tồn tại, để cài đặt từ đầu và tránh đụng dữ liệu khác.
- DB_USER cần quyền CREATEDB, hoặc database cần được tạo sẵn bằng tài khoản có quyền thích hợp.
- JWT_SECRET cần một giá trị bí mật ngẫu nhiên, không sử dụng chung giá trị demo. Có thể tạo bằng lệnh:
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
3.3. Khởi tạo database tự động
Chạy tại thư mục gốc dự án:
node scripts/setup-db.js
Script tạo database mới theo DB_NAME, rồi chạy tuần tự:
1. db/migrations/001_create_tables.sql
2. db/migrations/002_active_phone_index.sql
3. db/migrations/003_add_auth_columns.sql
4. db/seeds/001_seed_data.sql
5. db/seeds/002_duplicate_demo.sql
6. db/seeds/003_auth_demo.sql
Nếu database đã tồn tại, script dừng mặc định để tránh thay đổi dữ liệu. --existing chỉ dùng trên database demo đã được chủ động lựa chọn, vì nó có thể thực hiện INSERT/`UPDATE`.

Nếu không có quyền tạo database: tạo trước database trống bằng công cụ quản trị PostgreSQL, sau đó chạy node scripts/setup-db.js --existing chỉ trên database trống vừa tạo.
3.4. Chạy Backend
Mở PowerShell ở thư mục gốc:
npm start
Backend: http://localhost:3000
Kiểm tra sức khỏe:
curl.exe http://localhost:3000/health
Chế độ phát triển tự reload: npm run dev. Không chạy cả npm start và npm run dev cùng lúc trên port 3000.
3.5. Chạy Frontend
Mở terminal thứ hai:
cd frontend
npm run dev
Truy cập địa chỉ mà Vite hiển thị (thường http://localhost:5173). Vite proxy /api và /health sang Backend tại cổng 3000.
3.6. Tài khoản demo (chỉ dùng localhost)
Username	Password	Role
sales	MekongDemo@2026!	SALES
manager	MekongDemo@2026!	MANAGER


Mật khẩu trong database được lưu dạng bcrypt hash; mật khẩu demo được công khai để giảng viên thử chức năng. Không triển khai public với các tài khoản/mật khẩu demo này. Token JWT hiện lưu trong bộ nhớ tab; tải lại trang sẽ yêu cầu đăng nhập lại.
4. Cấu trúc dự án
cdtn1-nguyenthephuong-l1/
├── db/
│   ├── migrations/001_create_tables.sql, 002_active_phone_index.sql, 003_add_auth_columns.sql
│   └── seeds/001_seed_data.sql, 002_duplicate_demo.sql, 003_auth_demo.sql
├── docs/                      # SRS, API contract, sơ đồ và minh chứng
├── frontend/
│   └── src/
│       ├── api/               # API client, auth, customer, duplicate, merge
│       ├── components/
│       ├── pages/
│       └── App.jsx
├── scripts/setup-db.js
├── src/
│   ├── config/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── index.js
├── tests/
├── .env.example
├── package.json
└── README.md
Backend tổ chức theo hướng Routes → Services → Repositories → PostgreSQL; route nhận HTTP, service xử lý nghiệp vụ và repository truy cập SQL. Một số điểm ranh giới lớp vẫn cần rà soát trước khi coi kiến trúc đã hoàn toàn chuẩn.
5. Quy tắc nghiệp vụ và phân quyền
- Số điện thoại khách hàng phải hợp lệ và không được xung đột với hồ sơ đang hoạt động theo các ràng buộc của hệ thống.
- Hệ thống phát hiện hồ sơ có dấu hiệu nghi trùng dựa trên thông tin họ tên, điện thoại, email và địa chỉ.
- Chỉ cặp ở trạng thái PENDING mới được gộp. Việc gộp chọn hồ sơ chính, vô hiệu hóa hồ sơ phụ, cập nhật trạng thái MERGED và ghi lịch sử trong customer_merge.
- Gộp cần xác nhận và quyền MANAGER từ JWT; người dùng SALES không được gộp (API từ chối bằng HTTP 403).
- Các thao tác gộp sử dụng transaction để bảo đảm tính nhất quán dữ liệu.
6. Kiểm thử
6.1. Backend
npm test
Kết quả ghi nhận ngày 31/10/2026: 8/8 PASS (7 kiểm thử phát hiện nghi trùng, 1 kiểm thử middleware lỗi HTTP 500/requestId). Nhật ký mức error ở bài test HTTP 500 là kết quả thử lỗi có chủ đích.
6.2. Frontend
cd frontend
npm run lint
npm run build
Kết quả ghi nhận: ESLint và Vite build PASS; 26 modules được biên dịch.
6.3. Database và nghiệp vụ
Đã kiểm thử trên database tách biệt:
- Fresh Database: tạo mekong_mobile_l1_bt2_fresh; cả 3 migration và 3 seed PASS; tạo 2 users, 5 customers, 1 candidate ban đầu; xác nhận bcrypt khớp cho SALES và MANAGER.
- Seed chạy lại: cả 3 seed PASS hai lượt trên mekong_mobile_l1_c5_final (không ghi nhận lỗi SQL).
- Gộp bằng MANAGER: candidate #4 chuyển MERGED; customer #4 vẫn active, customer #5 inactive; customer_merge có lịch sử merge_id=1, merged_by=2.
- Phân quyền: giao diện SALES khóa thao tác gộp, MANAGER có thể thực hiện; API SALES từng được kiểm tra trả 403.
Chưa xác nhận: kiểm thử fresh clone từ bản GitHub đã push; kiểm thử rollback bằng cách gây lỗi SQL giữa transaction; bộ unit/integration test tự động cho toàn bộ endpoint CRUD và auth. Không xem các trường hợp này là đã PASS.
7. Lưu ý bảo mật và giới hạn
- Không commit .env, JWT secret thực hay mật khẩu PostgreSQL; chỉ commit .env.example với giá trị bí mật để trống.
- Không commit node_modules, frontend/dist hay file sao lưu .bak.
- Dữ liệu mẫu là dữ liệu minh họa; hệ thống phục vụ mục đích học tập và chạy cục bộ, chưa được kiểm thử đủ để triển khai công khai.
- Nếu đổi API hoặc nghiệp vụ so với SRS/API Contract, cập nhật tài liệu tương ứng trong docs/.
8. Repository
GitHub: https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1

Bài nộp Bài tập 2 dự kiến dùng tag v0.2; chỉ tạo tag sau khi đã kiểm tra và push các thay đổi cuối cùng.