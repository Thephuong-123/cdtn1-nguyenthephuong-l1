
const pool = require('../config/db');

// Tìm tài khoản theo tên đăng nhập
async function findByUsername(username) {
  const result = await pool.query(
    `SELECT
       user_id,
       full_name,
       username,
       password_hash,
       role
     FROM app_user
     WHERE username = $1`,
    [username]
  );

  return result.rows[0] || null;
}

// Tìm tài khoản theo ID
async function findById(userId) {
  const result = await pool.query(
    `SELECT
       user_id,
       full_name,
       username,
       role
     FROM app_user
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByUsername,
  findById
};
