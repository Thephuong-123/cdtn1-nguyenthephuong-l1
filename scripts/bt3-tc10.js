const assert = require('node:assert/strict');
const pool = require('../src/config/db');
const mergeService = require('../src/services/merge.service');

async function main() {
  const dbResult = await pool.query(
    'SELECT current_database() AS db'
  );

  const dbName = dbResult.rows[0].db;

  if (dbName !== 'mekong_mobile_l1_bt3_test') {
    throw new Error('SAI_DATABASE: ' + dbName);
  }

  console.log('Database:', dbName);

  // Kiem tra du lieu truoc khi gop
  const before = await pool.query(
    `SELECT candidate_id, customer_id_1, customer_id_2, status
     FROM duplicate_candidate
     WHERE candidate_id = 1`
  );

  assert.equal(before.rowCount, 1);
  assert.equal(before.rows[0].status, 'PENDING');

  const customersBefore = await pool.query(
    `SELECT customer_id, is_active
     FROM customer
     WHERE customer_id IN (2, 3)
     ORDER BY customer_id`
  );

  assert.equal(customersBefore.rowCount, 2);
  assert.ok(customersBefore.rows.every(c => c.is_active));

  console.log('BEFORE: PENDING, 2 customers active');

  // Goi nghiep vu gop that
  const result = await mergeService.mergeCustomers({
    manager_confirmed: true,
    manager_id: 2,
    candidate_id: 1,
    primary_customer_id: 3,
    selected_data: {
      full_name: 'Nguyen Van A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      address: 'Ho Chi Minh City'
    }
  });

  assert.equal(Number(result.customer.customer_id), 3);

  // Kiem tra du lieu da COMMIT
  const customersAfter = await pool.query(
    `SELECT customer_id, full_name, phone, is_active
     FROM customer
     WHERE customer_id IN (2, 3)
     ORDER BY customer_id`
  );

  const primary = customersAfter.rows.find(
    c => Number(c.customer_id) === 3
  );

  const duplicate = customersAfter.rows.find(
    c => Number(c.customer_id) === 2
  );

  assert.equal(primary.is_active, true);
  assert.equal(primary.phone, '0901234567');
  assert.equal(duplicate.is_active, false);

  const candidateAfter = await pool.query(
    `SELECT status, reviewed_by
     FROM duplicate_candidate
     WHERE candidate_id = 1`
  );

  assert.equal(candidateAfter.rows[0].status, 'MERGED');
  assert.equal(Number(candidateAfter.rows[0].reviewed_by), 2);

  const history = await pool.query(
    `SELECT merge_id
     FROM customer_merge
     WHERE primary_customer_id = 3
       AND duplicate_customer_id = 2
       AND merged_by = 2`
  );

  assert.equal(history.rowCount, 1);

  console.log('AFTER: primary=3 ACTIVE, duplicate=2 INACTIVE');
  console.log('CANDIDATE: MERGED');
  console.log('MERGE HISTORY: 1 record');
  console.log('TC-10: PASS');
}

main()
  .catch(error => {
    console.error('TC-10: FAIL -', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
