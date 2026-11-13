
-- Du lieu demo phat hien nghi trung.
-- Chi chay tren database thu nghiem.

BEGIN;

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
        ('Nguyen Van Test', '0901111222', 'test.a@example.com', 'Ca Mau'),
        ('Nguyen Van Tet', '0901111333', 'test.b@example.com', 'Ca Mau')
) AS v(full_name, phone, email, address)
WHERE NOT EXISTS (
    SELECT 1
    FROM customer c
    WHERE c.phone = v.phone
);

COMMIT;

-- Khong INSERT vao duplicate_candidate.
-- Website se tu phat hien khi mo man hinh M3.
