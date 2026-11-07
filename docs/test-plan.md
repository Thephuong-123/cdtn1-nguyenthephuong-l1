# TEST PLAN – BÀI TẬP 3
## Track SE – Luồng L1: Quản lý và hợp nhất hồ sơ khách hàng

### 1. Phạm vi kiểm thử

**Trong phạm vi:**
- Tạo, tra cứu, xem và cập nhật hồ sơ khách hàng.
- Phát hiện và so sánh hồ sơ nghi trùng.
- Xác nhận và gộp hồ sơ khách hàng trùng.
- Kiểm tra các quy tắc nghiệp vụ BR1–BR7 trong docs/srs.md.
- Kiểm tra xác thực JWT, phân quyền SALES/MANAGER.
- Kiểm tra tính toàn vẹn dữ liệu và rollback khi gộp.
- Kiểm tra khả năng chạy lại migration và seed.

**Chủ ý không kiểm:**
- Phân khúc khách hàng, marketing, bán hàng, bảo hành, kho: ngoài phạm vi L1.
- Kiểm thử tải và hiệu năng quy mô lớn: không thuộc trọng tâm workshop Buổi 14.
- Đánh giá khả dụng với người dùng thật: chưa tổ chức thử nghiệm người dùng.

### 2. Loại test và số lượng

Mục tiêu thiết kế: 12 test case thuộc ba tầng:
- 6 unit test: kiểm tra hàm và quy tắc nghiệp vụ độc lập.
- 3 integration test: kiểm tra nghiệp vụ kết hợp repository và PostgreSQL thử nghiệm.
- 3 API test: kiểm tra phản hồi HTTP, xác thực và phân quyền.

Bộ test phải bao phủ đủ năm loại:
1. Luồng đúng: ít nhất một test cho mỗi BR1–BR7.
2. Giá trị biên: ít nhất hai test ở hai bên cùng một ranh giới.
3. Dữ liệu sai: ít nhất hai test, kiểm tra mã trạng thái và nội dung lỗi.
4. Bảo mật/chất lượng dữ liệu: ít nhất một test.
5. Tính tái lập: ít nhất một test.

Kỹ thuật thiết kế: phân vùng tương đương và phân tích giá trị biên.

Các nhóm trên có thể giao nhau; một test case có thể kiểm tra quy tắc nghiệp vụ và đồng thời thuộc loại bảo mật hoặc giá trị biên.

### 3. Tiêu chí thành công

- Có 10–12 test case đã chạy thật, mỗi case đủ tám cột và có ảnh chụp.
- Đủ năm loại test bắt buộc; mỗi BR1–BR7 có ít nhất một test.
- Kết quả thực tế được ghi trung thực, không tự đánh dấu PASS trước khi chạy.
- Sau khi sửa các bug đã phát hiện, toàn bộ bộ test tự động PASS bằng một lệnh npm test.
- Không còn bug Critical đang mở.
- Mỗi bug đã sửa có mô tả nguyên nhân, cách sửa, commit riêng và kết quả kiểm thử lại.
- Kiểm thử tái lập không tạo dữ liệu trùng hoặc gây thay đổi ngoài dự kiến.

### 4. Môi trường và dữ liệu thử

- Hệ điều hành: Windows.
- Backend: Node.js và Express.
- Frontend: React và Vite.
- Cơ sở dữ liệu: PostgreSQL 16.
- Công cụ kiểm thử hiện có: node:test, node:assert.
- Lệnh kiểm thử: npm test.
- Unit test sử dụng dữ liệu cụ thể được khai báo trong mã kiểm thử, không phụ thuộc database.
- Integration và API test sử dụng dữ liệu thử được dựng có kiểm soát.
- Các test có ghi dữ liệu phải dùng database riêng cho kiểm thử, không dùng database đang phục vụ demo.
- Phải xác định cách khởi tạo và dọn dữ liệu trước khi triển khai integration test.
- Ảnh chụp kết quả lưu trong docs/screenshots/ theo mã test case.

**Trạng thái:** Kế hoạch kiểm thử. Số lượng và kết quả PASS/FAIL sẽ được xác nhận trong Test Report sau khi chạy thật.
