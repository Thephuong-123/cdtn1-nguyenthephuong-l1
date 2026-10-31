
const duplicateRepository = require('../repositories/duplicate.repository');

// Lấy danh sách cặp hồ sơ nghi trùng
async function getAllCandidates() {
  return await duplicateRepository.findAllCandidates();
}

// Kiểm tra và chuyển ID thành số nguyên dương
function validateCandidateId(id) {
  const candidateId = Number(id);

  if (
    !Number.isSafeInteger(candidateId) ||
    candidateId <= 0
  ) {
    throw new Error('INVALID_CANDIDATE_ID');
  }

  return candidateId;
}

// Xem chi tiết một cặp hồ sơ nghi trùng
async function getCandidateById(id) {
  const candidateId = validateCandidateId(id);

  const candidate =
    await duplicateRepository.findCandidateById(candidateId);

  if (!candidate) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }

  return candidate;
}

// Xóa cặp hồ sơ nghi trùng chưa được xử lý
async function deleteCandidate(id) {
  const candidateId = validateCandidateId(id);

  // Chỉ xóa khi trạng thái vẫn là PENDING.
  // Điều kiện được kiểm tra trực tiếp trong câu SQL DELETE.
  const deleted =
    await duplicateRepository.deletePendingCandidate(candidateId);

  if (deleted) {
    return {
      message: 'Đã xóa cặp hồ sơ nghi trùng.',
      candidate_id: deleted.candidate_id
    };
  }

  // Nếu không xóa được, xác định nguyên nhân để trả lỗi phù hợp.
  const candidate =
    await duplicateRepository.findCandidateStatusById(candidateId);

  if (!candidate) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }

  throw new Error('CANDIDATE_ALREADY_PROCESSED');
}

module.exports = {
  getAllCandidates,
  getCandidateById,
  deleteCandidate
};
