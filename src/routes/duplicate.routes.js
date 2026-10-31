
const express = require('express');
const router = express.Router();

const duplicateService = require('../services/duplicate.service');
const detectionService = require('../services/duplicate-detection.service');

// GET /api/duplicates
// Lấy danh sách các cặp hồ sơ nghi trùng - US5
router.get('/', async (req, res, next) => {
  try {
    const candidates = await duplicateService.getAllCandidates();

    return res.status(200).json(candidates);

  } catch (error) {
    error.statusCode = 500;
    error.publicCode = 'INTERNAL_SERVER_ERROR';
    error.publicMessage = 'Không thể tải danh sách hồ sơ nghi trùng.';

    return next(error);
  }
});

// POST /api/duplicates/scan
// Tự động rà soát và phát hiện hồ sơ nghi trùng
router.post('/scan', async (req, res, next) => {
  try {
    const result = await detectionService.scanDuplicates();

    return res.status(200).json(result);

  } catch (error) {
    error.statusCode = 500;
    error.publicCode = 'DUPLICATE_SCAN_FAILED';
    error.publicMessage = 'Không thể quét hồ sơ nghi trùng.';

    return next(error);
  }
});

// GET /api/duplicates/:id
// Lấy chi tiết một cặp hồ sơ nghi trùng - US6
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await duplicateService.getCandidateById(
      req.params.id
    );

    return res.status(200).json(candidate);

  } catch (error) {
    if (error.message === 'INVALID_CANDIDATE_ID') {
      return res.status(400).json({
        error: 'INVALID_CANDIDATE_ID',
        message: 'Mã cặp hồ sơ không hợp lệ.'
      });
    }

    if (error.message === 'CANDIDATE_NOT_FOUND') {
      return res.status(404).json({
        error: 'CANDIDATE_NOT_FOUND',
        message: 'Không tìm thấy cặp hồ sơ nghi trùng.'
      });
    }

    error.statusCode = 500;
    error.publicCode = 'INTERNAL_SERVER_ERROR';
    error.publicMessage = 'Không thể tải chi tiết hồ sơ nghi trùng.';

    return next(error);
  }
});

// DELETE /api/duplicates/:id
// Chỉ xóa kết quả quét nghi trùng chưa được xử lý (PENDING)
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await duplicateService.deleteCandidate(
      req.params.id
    );

    return res.status(200).json(result);

  } catch (error) {
    if (error.message === 'INVALID_CANDIDATE_ID') {
      return res.status(400).json({
        error: 'INVALID_CANDIDATE_ID',
        message: 'Mã cặp hồ sơ không hợp lệ.'
      });
    }

    if (error.message === 'CANDIDATE_NOT_FOUND') {
      return res.status(404).json({
        error: 'CANDIDATE_NOT_FOUND',
        message: 'Không tìm thấy cặp hồ sơ nghi trùng.'
      });
    }

    if (error.message === 'CANDIDATE_ALREADY_PROCESSED') {
      return res.status(409).json({
        error: 'CANDIDATE_ALREADY_PROCESSED',
        message: 'Không thể xóa cặp hồ sơ đã được xử lý.'
      });
    }

    error.statusCode = 500;
    error.publicCode = 'INTERNAL_SERVER_ERROR';
    error.publicMessage = 'Không thể xóa cặp hồ sơ nghi trùng.';

    return next(error);
  }
});

module.exports = router;
