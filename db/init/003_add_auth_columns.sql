
-- BT2 - Bo sung thong tin dang nhap cho app_user
-- Khong xoa hoac thay doi tai khoan hien co

ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Dam bao ten dang nhap khong bi trung
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_username
ON app_user(username);
