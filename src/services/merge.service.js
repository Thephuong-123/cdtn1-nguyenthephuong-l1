
const pool = require('../config/db');
const mergeRepository = require('../repositories/merge.repository');

// Kiểm tra ID hợp lệ
function validId(value) {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

// Kiểm tra số điện thoại
function validPhone(phone) {
  return typeof phone === 'string' && /^0\d{9}$/.test(phone);
}

// Tạo lỗi nghiệp vụ
function createError(code) {
  return new Error(code);
}

// US7: Gộp hồ sơ khách hàng
async function mergeCustomers(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createError('INVALID_MERGE_DATA');
  }

  // 1. Kiểm tra xác nhận quản lý trong bản demo
  if (data.manager_confirmed !== true) {
    throw createError('MANAGER_CONFIRMATION_REQUIRED');
  }

  const managerId = validId(data.manager_id);

  if (!managerId) {
    throw createError('INVALID_MANAGER_ID');
  }

  // 2. Kiểm tra vai trò quản lý trong database
  // Đây là mô phỏng xác nhận, không phải xác thực đăng nhập
  const managerResult = await pool.query(
    `SELECT user_id, role
     FROM app_user
     WHERE user_id = $1`,
    [managerId]
  );

  if (
    managerResult.rowCount === 0 ||
    managerResult.rows[0].role !== 'MANAGER'
  ) {
    throw createError('MANAGER_NOT_FOUND');
  }

  // 3. Kiểm tra ID cặp hồ sơ và hồ sơ chính
  const candidateId = validId(data.candidate_id);
  const primaryCustomerId = validId(data.primary_customer_id);

  if (!candidateId || !primaryCustomerId) {
    throw createError('INVALID_CUSTOMER_ID');
  }

  // 4. Kiểm tra dữ liệu giữ lại
  const selectedData = data.selected_data;

  if (
    !selectedData ||
    typeof selectedData !== 'object' ||
    Array.isArray(selectedData)
  ) {
    throw createError('INVALID_MERGE_DATA');
  }

  const fullName =
    typeof selectedData.full_name === 'string'
      ? selectedData.full_name.trim()
      : '';

  const phone =
    typeof selectedData.phone === 'string'
      ? selectedData.phone.trim()
      : '';

  const email =
    typeof selectedData.email === 'string'
      ? selectedData.email.trim()
      : '';

  const address =
    typeof selectedData.address === 'string'
      ? selectedData.address.trim()
      : '';

  if (!fullName || fullName.length > 120) {
    throw createError('INVALID_FULL_NAME');
  }

  if (!validPhone(phone)) {
    throw createError('INVALID_PHONE');
  }

  if (
    email.length > 150 ||
    address.length > 255 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    throw createError('INVALID_MERGE_DATA');
  }

  // 5. Gọi Repository thực hiện Transaction
  return mergeRepository.mergeCustomers({
    candidateId,
    primaryCustomerId,
    managerId,
    selectedData: {
      full_name: fullName,
      phone,
      email: email || null,
      address: address || null
    }
  });
}

module.exports = {
  mergeCustomers
};
