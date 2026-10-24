
const express = require('express');
const router = express.Router();

const mergeService = require('../services/merge.service');

// POST /api/merges
// US7 - Gộp hồ sơ trong bản prototype CDTN1
router.post('/', async (req, res) => {
  try {
    const result = await mergeService.mergeCustomers(req.body);

    return res.status(200).json(result);

  } catch (error) {
    const errorMap = {
      MANAGER_CONFIRMATION_REQUIRED: [
        400,
        'Cần xác nhận của quản lý trước khi gộp.'
      ],
      INVALID_MANAGER_ID: [
        400,
        'Mã quản lý không hợp lệ.'
      ],
      MANAGER_NOT_FOUND: [
        403,
        'Không tìm thấy tài khoản quản lý hợp lệ.'
      ],
      INVALID_CUSTOMER_ID: [
        400,
        'Mã hồ sơ không hợp lệ.'
      ],
      INVALID_MERGE_DATA: [
        400,
        'Dữ liệu gộp không hợp lệ.'
      ],
      INVALID_FULL_NAME: [
        400,
        'Họ và tên không hợp lệ.'
      ],
      INVALID_PHONE: [
        400,
        'Số điện thoại không hợp lệ.'
      ],
      CANDIDATE_NOT_FOUND: [
        404,
        'Không tìm thấy cặp hồ sơ nghi trùng.'
      ],
      CANDIDATE_ALREADY_PROCESSED: [
        409,
        'Cặp hồ sơ đã được xử lý.'
      ],
      INVALID_PRIMARY_CUSTOMER: [
        400,
        'Hồ sơ chính không thuộc cặp nghi trùng.'
      ],
      CUSTOMER_NOT_ACTIVE: [
        409,
        'Một trong hai hồ sơ không còn hoạt động.'
      ]
    };

    // Số điện thoại xung đột với hồ sơ đang hoạt động
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'PHONE_ALREADY_EXISTS',
        message: 'Số điện thoại đã thuộc một hồ sơ khác.'
      });
    }

    const mapped = errorMap[error.message];

    if (mapped) {
      return res.status(mapped[0]).json({
        error: error.message,
        message: mapped[1]
      });
    }

    console.error('Merge customers error:', error);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Không thể gộp hồ sơ. Vui lòng kiểm tra dữ liệu.'
    });
  }
});

module.exports = router;
