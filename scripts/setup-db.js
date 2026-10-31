
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const databaseName = process.env.DB_NAME;

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const migrations = [
  'db/migrations/001_create_tables.sql',
  'db/migrations/002_active_phone_index.sql',
  'db/migrations/003_add_auth_columns.sql'
];

const seeds = [
  'db/seeds/001_seed_data.sql',
  'db/seeds/002_duplicate_demo.sql',
  'db/seeds/003_auth_demo.sql'
];

async function main() {
  if (!databaseName || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(databaseName)) {
    throw new Error('DB_NAME không hợp lệ.');
  }

  if (!config.user || !config.password) {
    throw new Error('Thiếu DB_USER hoặc DB_PASSWORD trong .env.');
  }

  // Không kết nối vào database đích để tạo chính nó.
  const admin = new Client({
    ...config,
    database: 'postgres'
  });

  let db;

  try {
    await admin.connect();

    const exists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (exists.rowCount > 0) {
      throw new Error(
        `Database "${databaseName}" đã tồn tại. Không thực hiện cài đặt.`
      );
    }

    // DB_NAME đã được kiểm tra chỉ gồm chữ, số và dấu gạch dưới.
    await admin.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Đã tạo database: ${databaseName}`);

    db = new Client({
      ...config,
      database: databaseName
    });

    await db.connect();

    for (const file of [...migrations, ...seeds]) {
      const filePath = path.join(__dirname, '..', file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await db.query(sql);
      console.log(`PASS: ${file}`);
    }

    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM app_user) AS users,
        (SELECT COUNT(*) FROM customer) AS customers,
        (SELECT COUNT(*) FROM duplicate_candidate) AS candidates
    `);

    console.table(result.rows);
    console.log('DATABASE SETUP: PASS');
  } finally {
    if (db) await db.end();
    await admin.end();
  }
}

main().catch(error => {
  console.error('DATABASE SETUP: FAIL');
  console.error(error.message);
  process.exitCode = 1;
});
