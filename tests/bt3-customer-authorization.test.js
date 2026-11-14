
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const pool = require('../src/config/db');
const customerService = require('../src/services/customer.service');
const customerRoutes = require('../src/routes/customer.routes');

test('BT3 T02 - Kiem tra phan quyen theo ho so', async (t) => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'bt3-authorization-test-secret';

  t.after(() => {
    if (oldSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = oldSecret;
    }
  });

  // Gia lap 3 nguoi dung:
  // SALES 1, SALES 2 va MANAGER 3.
  t.mock.method(pool, 'query', async (sql, params) => {
    const id = Number(params[0]);

    const users = {
      1: { user_id: 1, role: 'SALES' },
      2: { user_id: 2, role: 'SALES' },
      3: { user_id: 3, role: 'MANAGER' }
    };

    const user = users[id];

    return {
      rowCount: user ? 1 : 0,
      rows: user ? [user] : []
    };
  });

  // Ho so 10 do SALES 2 tao.
  t.mock.method(
    customerService,
    'getCustomerById',
    async (id) => {
      if (Number(id) === 999) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }

      return {
        customer_id: Number(id),
        full_name: 'Khach hang Test',
        created_by: 2,
        is_active: true
      };
    }
  );

  const updateMock = t.mock.method(
    customerService,
    'updateCustomer',
    async (id, data) => ({
      customer_id: Number(id),
      ...data
    })
  );

  const deleteMock = t.mock.method(
    customerService,
    'deactivateCustomer',
    async (id) => ({
      customer_id: Number(id),
      is_active: false
    })
  );

  const app = express();
  app.use(express.json());
  app.use('/api/customers', customerRoutes);

  const server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
    server.once('error', reject);
  });

  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  function tokenFor(userId) {
    return jwt.sign(
      {},
      process.env.JWT_SECRET,
      {
        subject: String(userId),
        algorithm: 'HS256',
        expiresIn: '5m'
      }
    );
  }

  async function request(method, id, userId) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (userId !== null) {
      headers.Authorization = `Bearer ${tokenFor(userId)}`;
    }

    const options = { method, headers };

    if (method === 'PATCH') {
      options.body = JSON.stringify({
        full_name: 'Ten cap nhat',
        phone: '0901234567'
      });
    }

    return fetch(`${baseUrl}/api/customers/${id}`, options);
  }

  // 1. Khong dang nhap -> 401.
  let res = await request('PATCH', 10, null);
  assert.equal(res.status, 401);
  assert.equal(updateMock.mock.callCount(), 0);

  // 2. SALES 1 sua ho so cua SALES 2 -> 403.
  res = await request('PATCH', 10, 1);
  assert.equal(res.status, 403);
  assert.equal(updateMock.mock.callCount(), 0);

  // 3. SALES 2 sua ho so cua chinh minh -> 200.
  res = await request('PATCH', 10, 2);
  assert.equal(res.status, 200);
  assert.equal(updateMock.mock.callCount(), 1);

  // 4. MANAGER sua ho so cua SALES -> 200.
  res = await request('PATCH', 10, 3);
  assert.equal(res.status, 200);
  assert.equal(updateMock.mock.callCount(), 2);

  // 5. SALES 1 xoa ho so cua SALES 2 -> 403.
  res = await request('DELETE', 10, 1);
  assert.equal(res.status, 403);
  assert.equal(deleteMock.mock.callCount(), 0);

  // 6. SALES 2 xoa ho so cua chinh minh -> 200.
  res = await request('DELETE', 10, 2);
  assert.equal(res.status, 200);
  assert.equal(deleteMock.mock.callCount(), 1);

  // 7. Ho so khong ton tai -> 404.
  res = await request('PATCH', 999, 3);
  assert.equal(res.status, 404);
  assert.equal(updateMock.mock.callCount(), 2);
});
