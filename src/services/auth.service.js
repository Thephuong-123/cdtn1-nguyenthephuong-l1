const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRepository = require('../repositories/auth.repository');

// Đăng nhập bằng username và password
async function login(data) {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    typeof data.username !== 'string' ||
    typeof data.password !== 'string'
  ) {
    throw new Error('INVALID_LOGIN_DATA');
  }

  const username = data.username.trim();
  const password = data.password;

  if (!username || !password) {
    throw new Error('INVALID_LOGIN_DATA');
  }

  // Tìm người dùng trong database
  const user = await authRepository.findByUsername(username);

  // Không tiết lộ username hay mật khẩu nào bị sai
  if (
    !user ||
    !user.password_hash ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    throw new Error('INVALID_CREDENTIALS');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET_NOT_CONFIGURED');
  }

  // Tạo JWT có thời hạn 2 giờ
  const token = jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(user.user_id),
      expiresIn: '2h',
      algorithm: 'HS256'
    }
  );

  return {
    token,
    token_type: 'Bearer',
    expires_in: 7200,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      username: user.username,
      role: user.role
    }
  };
}

module.exports = {
  login
};
