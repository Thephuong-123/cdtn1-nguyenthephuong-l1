
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Xác thực JWT
async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập để tiếp tục.'
      });
    }

    const token = authorization.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Không thể xác thực phiên đăng nhập.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    const userId = Number(decoded.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token đăng nhập không hợp lệ.'
      });
    }

    // Đọc quyền hiện tại từ PostgreSQL
    const result = await pool.query(
      `SELECT user_id, full_name, role
       FROM app_user
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Tài khoản không tồn tại.'
      });
    }

    req.user = result.rows[0];
    next();

  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
      });
    }

    console.error('Authentication error:', error);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Không thể kiểm tra phiên đăng nhập.'
    });
  }
}

// Chỉ cho phép tài khoản MANAGER
function requireManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Vui lòng đăng nhập.'
    });
  }

  if (req.user.role !== 'MANAGER') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Chỉ quản lý mới được phép gộp hồ sơ.'
    });
  }

  next();
}

module.exports = {
  authenticate,
  requireManager
};
