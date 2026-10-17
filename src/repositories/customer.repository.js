const pool = require('../config/db');

async function findAll() {
  const result = await pool.query(
    'SELECT * FROM customer WHERE is_active = TRUE ORDER BY customer_id'
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM customer WHERE customer_id = $1 AND is_active = TRUE',
    [id]
  );

  return result.rows[0];
}

async function findByPhone(phone) {
  const result = await pool.query(
    'SELECT * FROM customer WHERE phone = $1 AND is_active = TRUE',
    [phone]
  );

  return result.rows[0];
}

async function createCustomer(customer) {
  const { full_name, phone, email, address, created_by } = customer;

  const result = await pool.query(
    `INSERT INTO customer
      (full_name, phone, email, address, created_by, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING *`,
    [full_name, phone, email, address, created_by]
  );

  return result.rows[0];
}

async function updateCustomer(id, customer) {
  const { full_name, phone, email, address } = customer;

  const result = await pool.query(
    `UPDATE customer
     SET full_name = $1,
         phone = $2,
         email = $3,
         address = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE customer_id = $5
       AND is_active = TRUE
     RETURNING *`,
    [full_name, phone, email, address, id]
  );

  return result.rows[0];
}

async function deactivateCustomer(id) {
  const result = await pool.query(
    `UPDATE customer
     SET is_active = FALSE,
         updated_at = CURRENT_TIMESTAMP
     WHERE customer_id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  findAll,
  findById,
  findByPhone,
  createCustomer,
  updateCustomer,
  deactivateCustomer
};