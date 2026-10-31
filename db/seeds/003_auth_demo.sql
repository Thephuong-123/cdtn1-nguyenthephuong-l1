
-- BT2 - Seed tai khoan dang nhap demo
-- Chay sau migrations 001, 002, 003 va seed 001.
-- Chi su dung cho database demo.

BEGIN;

-- Gan username cho hai tai khoan duoc seed 001 tao.
-- Khong tao them user trung lap.
UPDATE app_user
SET username = 'sales'
WHERE full_name = 'Nguyen Van An'
  AND role = 'SALES'
  AND username IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM app_user WHERE username = 'sales'
  );

UPDATE app_user
SET username = 'manager'
WHERE full_name = 'Tran Thi Binh'
  AND role = 'MANAGER'
  AND username IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM app_user WHERE username = 'manager'
  );

-- Truong hop tai khoan demo chua ton tai.
INSERT INTO app_user (full_name, role, username)
SELECT 'Nguyen Van An', 'SALES', 'sales'
WHERE NOT EXISTS (
  SELECT 1 FROM app_user WHERE username = 'sales'
);

INSERT INTO app_user (full_name, role, username)
SELECT 'Tran Thi Binh', 'MANAGER', 'manager'
WHERE NOT EXISTS (
  SELECT 1 FROM app_user WHERE username = 'manager'
);

-- Gan bcrypt hash cho tai khoan demo.
-- Chi thiet lap neu chua co mat khau.
UPDATE app_user
SET password_hash =
  '$2b$12$jL8zUXvaOfX1R91Lx2/iW.vCeFmgeS6K5PrnqIXw1GimbUET9mYeu'
WHERE username IN ('sales', 'manager')
  AND password_hash IS NULL;

COMMIT;
