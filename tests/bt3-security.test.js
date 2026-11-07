const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const pool = require('../src/config/db');
const mergeService = require('../src/services/merge.service');
const mergeRoutes = require('../src/routes/merge.routes');

test('BT3-TC-09 - SALES khong duoc phep gop ho so', async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'bt3-test-secret-only';

  t.after(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  // Gia lap tai khoan SALES trong database.
  t.mock.method(pool, 'query', async () => ({
    rowCount: 1,
    rows: [{
      user_id: 1,
      full_name: 'Nhan vien Test',
      role: 'SALES'
    }]
  }));

  // Dam bao khong thuc hien nghiep vu gop.
  const mergeMock = t.mock.method(
    mergeService,
    'mergeCustomers',
    async () => {
      throw new Error('MERGE_SHOULD_NOT_RUN');
    }
  );

  const app = express();
  app.use(express.json());
  app.use('/api/merges', mergeRoutes);

  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve, reject) => {
      if (server.listening) return resolve();
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const port = server.address().port;

    const token = jwt.sign(
      { sub: '1' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '5m' }
    );

    const response = await fetch(
      `http://127.0.0.1:${port}/api/merges`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          manager_confirmed: true,
          candidate_id: 1,
          primary_customer_id: 10,
          selected_data: {
            full_name: 'Nguyen Van An',
            phone: '0912345670',
            email: 'an@example.com',
            address: 'Ca Mau'
          }
        })
      }
    );

    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.error, 'FORBIDDEN');
    assert.equal(mergeMock.mock.callCount(), 0);

  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
