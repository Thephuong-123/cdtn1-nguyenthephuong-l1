# API Contract – L1 Quản lý và hợp nhất hồ sơ khách hàng

## 1. Danh sách endpoint

| Phương thức | Đường dẫn | Mục đích | User Story |
| --- | --- | --- | --- |
| GET | /api/customers?phone={phone} | Tra cứu khách hàng theo số điện thoại | US2 |
| POST | /api/customers | Tạo hồ sơ khách hàng mới | US1 |
| GET | /api/customers/{id} | Xem chi tiết hồ sơ khách hàng | US3 |
| PATCH | /api/customers/{id} | Cập nhật hồ sơ khách hàng | US4 |
| GET | /api/customers/{id}/duplicates | Xem danh sách hồ sơ nghi trùng | US5, US6 |
| GET | /api/customers/compare?ids={id1},{id2} | So sánh hai hồ sơ nghi trùng | US7 |
| POST | /api/customers/merge | Gộp hai hồ sơ khách hàng trùng | US8 |

## 2. Quy ước chung

- Định dạng trao đổi dữ liệu: JSON, UTF-8.
- Header khi gửi JSON: Content-Type: application/json.
- Tên trường sử dụng snake_case.
- Thời gian sử dụng chuẩn ISO 8601.
- Mọi response lỗi dùng cấu trúc:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi",
    "fields": {}
  }
}
## 3. Chi tiết endpoint cho User Story mức MUST

### 3.1 GET /api/customers?phone={phone}

**Mục đích:** Tra cứu khách hàng theo số điện thoại.  
**User Story:** US2

#### Request

```text
GET /api/customers?phone=0901234567
{
  "customer_id": 1024,
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Ho Chi Minh City"
}
{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Số điện thoại không hợp lệ",
    "fields": {
      "phone": "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"
    }
  }
}
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Không tìm thấy khách hàng",
    "fields": {}
  }
}
{
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Ho Chi Minh City"
}
{
  "customer_id": 1024,
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Ho Chi Minh City"
}
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ",
    "fields": {
      "full_name": "Tên khách hàng không được để trống"
    }
  }
}
{
  "error": {
    "code": "PHONE_ALREADY_EXISTS",
    "message": "Số điện thoại đã tồn tại trong hệ thống",
    "fields": {
      "phone": "0901234567"
    }
  }
}
{
  "primary_customer_id": 1024,
  "duplicate_customer_id": 2048,
  "selected_values": {
    "full_name": "Nguyen Van A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "address": "Ho Chi Minh City"
  }
}
{
  "message": "Gộp hồ sơ thành công",
  "customer": {
    "customer_id": 1024,
    "full_name": "Nguyen Van A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "address": "Ho Chi Minh City"
  }
}
{
  "error": {
    "code": "MERGE_DATA_INCOMPLETE",
    "message": "Chưa chọn đầy đủ thông tin cần giữ lại",
    "fields": {}
  }
}
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Không tìm thấy một trong hai hồ sơ khách hàng",
    "fields": {}
  }
}
{
  "error": {
    "code": "MERGE_CONFLICT",
    "message": "Hai hồ sơ không còn đủ điều kiện để gộp",
    "fields": {}
  }
}