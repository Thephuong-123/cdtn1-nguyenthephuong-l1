
-- Dữ liệu demo phát hiện nghi trùng.
-- Chỉ chạy trên database thử nghiệm mới.

INSERT INTO customer (
    full_name,
    phone,
    email,
    address,
    created_by,
    is_active
)
VALUES
(
    'Nguyen Van Test',
    '0901111222',
    'test.a@example.com',
    'Ca Mau',
    1,
    TRUE
),
(
    'Nguyen Van Tet',
    '0901111333',
    'test.b@example.com',
    'Ca Mau',
    1,
    TRUE
);

-- Không INSERT vào duplicate_candidate.
-- Website sẽ tự phát hiện khi mở màn hình M3.
