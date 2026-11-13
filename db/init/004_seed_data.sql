BEGIN;

-- Them nhan vien mau neu chua ton tai
INSERT INTO app_user (full_name, role)
SELECT v.full_name, v.role
FROM (
    VALUES
        ('Nguyen Van An', 'SALES'),
        ('Tran Thi Binh', 'MANAGER')
) AS v(full_name, role)
WHERE NOT EXISTS (
    SELECT 1
    FROM app_user u
    WHERE u.full_name = v.full_name
      AND u.role = v.role
);

-- Them khach hang mau neu chua ton tai
INSERT INTO customer (
    full_name,
    phone,
    email,
    address,
    created_by,
    is_active
)
SELECT
    v.full_name,
    v.phone,
    v.email,
    v.address,
    (
        SELECT MIN(user_id)
        FROM app_user
        WHERE full_name = 'Nguyen Van An'
          AND role = 'SALES'
    ),
    TRUE
FROM (
    VALUES
        ('Nguyen Van A', '0901234567', 'nguyenvana@example.com', 'Ho Chi Minh City'),
        ('Nguyen Van B', '0902568974', 'nguyenvanb@example.com', 'Ho Chi Minh City'),
        ('Tran Thi C', '0912345678', 'tranthic@example.com', 'Ca Mau')
) AS v(full_name, phone, email, address)
WHERE NOT EXISTS (
    SELECT 1
    FROM customer c
    WHERE c.phone = v.phone
);

-- Them cap nghi trung neu chua ton tai
INSERT INTO duplicate_candidate (
    customer_id_1,
    customer_id_2,
    status,
    reviewed_by
)
SELECT c1.customer_id, c2.customer_id, 'PENDING', NULL
FROM customer c1
JOIN customer c2
  ON c1.phone = '0901234567'
 AND c2.phone = '0902568974'
WHERE NOT EXISTS (
    SELECT 1
    FROM duplicate_candidate dc
    WHERE (dc.customer_id_1 = c1.customer_id AND dc.customer_id_2 = c2.customer_id)
       OR (dc.customer_id_1 = c2.customer_id AND dc.customer_id_2 = c1.customer_id)
);

COMMIT;
