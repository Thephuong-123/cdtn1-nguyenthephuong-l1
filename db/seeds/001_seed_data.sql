INSERT INTO app_user (full_name, role)
VALUES
('Nguyen Van An', 'SALES'),
('Tran Thi Binh', 'MANAGER');

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
    'Nguyen Van A',
    '0901234567',
    'nguyenvana@example.com',
    'Ho Chi Minh City',
    1,
    TRUE
),
(
    'Nguyen Van B',
    '0902568974',
    'nguyenvanb@example.com',
    'Ho Chi Minh City',
    1,
    TRUE
),
(
    'Tran Thi C',
    '0912345678',
    'tranthic@example.com',
    'Ca Mau',
    1,
    TRUE
);

INSERT INTO duplicate_candidate (
    customer_id_1,
    customer_id_2,
    status,
    reviewed_by
)
VALUES
(
    1,
    2,
    'PENDING',
    NULL
);