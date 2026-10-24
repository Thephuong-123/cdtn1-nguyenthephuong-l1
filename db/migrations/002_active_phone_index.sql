
-- Migration 002
-- Chỉ yêu cầu số điện thoại duy nhất
-- đối với hồ sơ đang hoạt động.

BEGIN;

ALTER TABLE customer
DROP CONSTRAINT IF EXISTS customer_phone_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_active_phone
ON customer(phone)
WHERE is_active = TRUE;

COMMIT;
