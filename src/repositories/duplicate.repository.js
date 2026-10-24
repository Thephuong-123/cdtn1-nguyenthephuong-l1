
const pool = require('../config/db');

// Lấy danh sách các cặp hồ sơ nghi trùng
async function findAllCandidates() {
  const sql = `
    SELECT
      dc.candidate_id,
      dc.customer_id_1,
      dc.customer_id_2,
      dc.status,
      dc.detected_at,
      dc.reviewed_by,

      c1.full_name AS customer_1_name,
      c1.phone AS customer_1_phone,
      c1.email AS customer_1_email,
      c1.address AS customer_1_address,

      c2.full_name AS customer_2_name,
      c2.phone AS customer_2_phone,
      c2.email AS customer_2_email,
      c2.address AS customer_2_address

    FROM duplicate_candidate dc

    JOIN customer c1
      ON dc.customer_id_1 = c1.customer_id

    JOIN customer c2
      ON dc.customer_id_2 = c2.customer_id

    WHERE c1.is_active = TRUE
      AND c2.is_active = TRUE

    ORDER BY dc.detected_at DESC, dc.candidate_id DESC
  `;

  const result = await pool.query(sql);
  return result.rows;
}

// Lấy một cặp hồ sơ nghi trùng theo ID
async function findCandidateById(id) {
  const sql = `
    SELECT
      dc.*,
      row_to_json(c1) AS customer_1,
      row_to_json(c2) AS customer_2

    FROM duplicate_candidate dc

    JOIN customer c1
      ON dc.customer_id_1 = c1.customer_id

    JOIN customer c2
      ON dc.customer_id_2 = c2.customer_id

    WHERE dc.candidate_id = $1
      AND c1.is_active = TRUE
      AND c2.is_active = TRUE
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

module.exports = {
  findAllCandidates,
  findCandidateById
};
