const assert = require('node:assert/strict');
const pool = require('../src/config/db');
const mergeRepository = require('../src/repositories/merge.repository');

async function main() {
  // Chi cho phep chay tren database BT3.
  const db = await pool.query(
    'SELECT current_database() AS name'
  );

  assert.equal(
    db.rows[0].name,
    'mekong_mobile_l1_bt3_test',
    'SAI DATABASE - DUNG KIEM THU'
  );

  console.log('DATABASE:', db.rows[0].name);

  // Xac nhan hai ho so thu nghiem con hoat dong.
  const customers = await pool.query(`
    SELECT *
    FROM customer
    WHERE customer_id IN (4, 5)
    ORDER BY customer_id
  `);

  assert.equal(customers.rowCount, 2);
  assert.ok(customers.rows.every(c => c.is_active));

  // Dam bao ma quan ly gia khong ton tai.
  const invalidManagerId = 999999999;

  const manager = await pool.query(
    'SELECT user_id FROM app_user WHERE user_id = $1',
    [invalidManagerId]
  );

  assert.equal(manager.rowCount, 0);

  // Tao cap nghi trung rieng cho TC-11 neu chua co.
  const existing = await pool.query(`
    SELECT candidate_id, status
    FROM duplicate_candidate
    WHERE (customer_id_1 = 4 AND customer_id_2 = 5)
       OR (customer_id_1 = 5 AND customer_id_2 = 4)
    ORDER BY candidate_id
    LIMIT 1
  `);

  let candidateId;

  if (existing.rowCount > 0) {
    assert.equal(existing.rows[0].status, 'PENDING');
    candidateId = Number(existing.rows[0].candidate_id);
  } else {
    const created = await pool.query(`
      INSERT INTO duplicate_candidate (
        customer_id_1,
        customer_id_2,
        status
      )
      VALUES (4, 5, 'PENDING')
      RETURNING candidate_id
    `);

    candidateId = Number(created.rows[0].candidate_id);
  }

  // Luu trang thai truoc khi thu ROLLBACK.
  const beforeCustomers = await pool.query(`
    SELECT *
    FROM customer
    WHERE customer_id IN (4, 5)
    ORDER BY customer_id
  `);

  const beforeCandidate = await pool.query(
    `SELECT * FROM duplicate_candidate
     WHERE candidate_id = $1`,
    [candidateId]
  );

  const beforeHistory = await pool.query(`
    SELECT COUNT(*)::integer AS total
    FROM customer_merge
    WHERE primary_customer_id = 4
      AND duplicate_customer_id = 5
  `);

  console.log('BEFORE: 2 customers ACTIVE, candidate PENDING');

  // Co tinh gay loi khoa ngoai o buoc INSERT customer_merge.
  let expectedError = null;

  try {
    await mergeRepository.mergeCustomers({
      candidateId,
      primaryCustomerId: 4,
      managerId: invalidManagerId,
      selectedData: {
        full_name: 'Nguyen Van Test Updated',
        phone: '0901111222',
        email: 'rollback@example.com',
        address: 'Test Rollback'
      }
    });
  } catch (error) {
    expectedError = error;
  }

  // PostgreSQL 23503 = foreign_key_violation.
  assert.ok(expectedError, 'Khong phat sinh loi nhu du kien');
  assert.equal(expectedError.code, '23503');

  console.log('EXPECTED ERROR: PostgreSQL 23503');

  // Doc lai du lieu sau khi Repository thuc hien ROLLBACK.
  const afterCustomers = await pool.query(`
    SELECT *
    FROM customer
    WHERE customer_id IN (4, 5)
    ORDER BY customer_id
  `);

  const afterCandidate = await pool.query(
    `SELECT * FROM duplicate_candidate
     WHERE candidate_id = $1`,
    [candidateId]
  );

  const afterHistory = await pool.query(`
    SELECT COUNT(*)::integer AS total
    FROM customer_merge
    WHERE primary_customer_id = 4
      AND duplicate_customer_id = 5
  `);

  // Moi du lieu phai giong het truoc khi thu.
  assert.deepEqual(afterCustomers.rows, beforeCustomers.rows);
  assert.deepEqual(afterCandidate.rows, beforeCandidate.rows);
  assert.deepEqual(afterHistory.rows, beforeHistory.rows);

  console.log('AFTER: 2 customers van ACTIVE');
  console.log('CANDIDATE: van PENDING');
  console.log('MERGE HISTORY: khong tang');
  console.log('DATA: khong thay doi');
  console.log('TC-11: PASS - ROLLBACK SUCCESS');
}

main()
  .catch(error => {
    console.error('TC-11: FAIL -', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
