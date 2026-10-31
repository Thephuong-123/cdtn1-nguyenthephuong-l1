const express = require('express');
const router = express.Router();

const authService = require('../services/auth.service');

// POST /api/auth/login
// Đăng nhập bằng username và password
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === 'INVALID_LOGIN_DATA') {
      return res.status(400).json({
        error: 'INVALID_LOGIN_DATA',
        message: 'Vui lòng nhập username và password hợp lệ.'
      });
    }

    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    error.statusCode = 500;
    error.publicCode = 'INTERNAL_SERVER_ERROR';
    error.publicMessage = 'Không thể thực hiện đăng nhập.';

    return next(error);
  }
});

module.exports = router;
