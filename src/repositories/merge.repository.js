
const pool = require('../config/db');

/**
 * Gộp hai hồ sơ khách hàng trong một Transaction.
 *
 * @param {number} candidateId - Mã cặp hồ sơ nghi trùng
 * @param {number} primaryCustomerId - Hồ sơ được giữ lại
 * @param {number} managerId - ID quản lý xác nhận
 * @param {object} selectedData - Dữ liệu cuối cùng được giữ lại
 */
async function mergeCustomers({
  candidateId,
  primaryCustomerId,
  managerId,
  selectedData
}) {
  const client = await pool.connect();

  try {
    // Bắt đầu Transaction
    await client.query('BEGIN');

    // 1. Khóa cặp hồ sơ để tránh gộp đồng thời
    const candidateResult = await client.query(
      `SELECT *
       FROM duplicate_candidate
       WHERE candidate_id = $1
       FOR UPDATE`,
      [candidateId]
    );

    if (candidateResult.rowCount === 0) {
      throw new Error('CANDIDATE_NOT_FOUND');
    }

    const candidate = candidateResult.rows[0];

    if (candidate.status !== 'PENDING') {
      throw new Error('CANDIDATE_ALREADY_PROCESSED');
    }

    const customerId1 = Number(candidate.customer_id_1);
    const customerId2 = Number(candidate.customer_id_2);

    // 2. Kiểm tra hồ sơ chính thuộc cặp nghi trùng
    if (
      primaryCustomerId !== customerId1 &&
      primaryCustomerId !== customerId2
    ) {
      throw new Error('INVALID_PRIMARY_CUSTOMER');
    }

    const duplicateCustomerId =
      primaryCustomerId === customerId1
        ? customerId2
        : customerId1;

    // 3. Khóa hai hồ sơ khách hàng
    const customersResult = await client.query(
      `SELECT customer_id, is_active
       FROM customer
       WHERE customer_id IN ($1, $2)
       ORDER BY customer_id
       FOR UPDATE`,
      [customerId1, customerId2]
    );

    if (
      customersResult.rowCount !== 2 ||
      customersResult.rows.some(c => !c.is_active)
    ) {
      throw new Error('CUSTOMER_NOT_ACTIVE');
    }

    // 4. Cập nhật thông tin hồ sơ chính
    const updatedCustomer = await client.query(
      `UPDATE customer
       SET full_name = $1,
           phone = $2,
           email = $3,
           address = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $5
       RETURNING *`,
      [
        selectedData.full_name,
        selectedData.phone,
        selectedData.email,
        selectedData.address,
        primaryCustomerId
      ]
    );

    // 5. Vô hiệu hóa hồ sơ trùng
    await client.query(
      `UPDATE customer
       SET is_active = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1`,
      [duplicateCustomerId]
    );

    // 6. Lưu lịch sử gộp hồ sơ
    const mergeResult = await client.query(
      `INSERT INTO customer_merge (
         primary_customer_id,
         duplicate_customer_id,
         merged_by
       )
       VALUES ($1, $2, $3)
       RETURNING *`,
      [primaryCustomerId, duplicateCustomerId, managerId]
    );

    // 7. Đánh dấu cặp nghi trùng đã xử lý
    await client.query(
      `UPDATE duplicate_candidate
       SET status = 'MERGED',
           reviewed_by = $1
       WHERE candidate_id = $2`,
      [managerId, candidateId]
    );

    // 8. Hoàn tất Transaction
    await client.query('COMMIT');

    return {
      message: 'Gộp hồ sơ thành công.',
      merge: mergeResult.rows[0],
      customer: updatedCustomer.rows[0]
    };

  } catch (error) {
    // Nếu có lỗi, hoàn tác toàn bộ thay đổi
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError.message);
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  mergeCustomers
};
