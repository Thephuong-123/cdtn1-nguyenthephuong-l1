
const duplicateRepository = require('../repositories/duplicate.repository');

// Lấy danh sách các cặp hồ sơ nghi trùng
async function getAllCandidates() {
  return await duplicateRepository.findAllCandidates();
}

// Lấy chi tiết một cặp hồ sơ nghi trùng
async function getCandidateById(id) {
  const candidateId = Number(id);

  // Kiểm tra ID hợp lệ
  if (!Number.isSafeInteger(candidateId) || candidateId <= 0) {
    throw new Error('INVALID_CANDIDATE_ID');
  }

  const candidate = await duplicateRepository.findCandidateById(candidateId);

  if (!candidate) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }

  return candidate;
}

module.exports = {
  getAllCandidates,
  getCandidateById
};
