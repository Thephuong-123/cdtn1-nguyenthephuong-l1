
const express = require('express');
const router = express.Router();

const duplicateService = require('../services/duplicate.service');
const detectionService = require('../services/duplicate-detection.service');

// GET /api/duplicates
// Lấy danh sách các cặp hồ sơ nghi trùng - US5
router.get('/', async (req, res) => {
  try {
    const candidates = await duplicateService.getAllCandidates();

    return res.status(200).json(candidates);

  } catch (error) {
    console.error('Get duplicates error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Không thể tải danh sách hồ sơ nghi trùng.'
    });
  }
});

// POST /api/duplicates/scan
// Tự động rà soát và phát hiện hồ sơ nghi trùng
router.post('/scan', async (req, res) => {
  try {
    const result = await detectionService.scanDuplicates();

    return res.status(200).json(result);

  } catch (error) {
    console.error('Scan duplicates error:', error.message);

    return res.status(500).json({
      error: 'DUPLICATE_SCAN_FAILED',
      message: 'Không thể quét hồ sơ nghi trùng.'
    });
  }
});

// GET /api/duplicates/:id
// Lấy chi tiết một cặp hồ sơ nghi trùng - US6
router.get('/:id', async (req, res) => {
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

    console.error(
      'Get duplicate by ID error:',
      error.message
    );

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Không thể tải chi tiết hồ sơ nghi trùng.'
    });
  }
});

module.exports = router;
