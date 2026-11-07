const test = require('node:test');
const assert = require('node:assert/strict');

const pool = require('../src/config/db');
const mergeRepository = require('../src/repositories/merge.repository');
const mergeService = require('../src/services/merge.service');

test('BT3-TC-08 - Giu dung du lieu duoc chon khi gop', async (t) => {
  t.mock.method(pool, 'query', async () => ({
    rowCount: 1,
    rows: [{ user_id: 2, role: 'MANAGER' }]
  }));

  let receivedData = null;

  t.mock.method(mergeRepository, 'mergeCustomers', async (data) => {
    receivedData = data;
    return {
      message: 'Gop ho so thanh cong',
      customer: {
        customer_id: data.primaryCustomerId,
        ...data.selectedData
      }
    };
  });

  const result = await mergeService.mergeCustomers({
    manager_confirmed: true,
    manager_id: 2,
    candidate_id: 1,
    primary_customer_id: 10,
    selected_data: {
      full_name: 'Nguyen Van An',
      phone: '0912345670',
      email: 'an@example.com',
      address: 'Ca Mau'
    }
  });

  assert.equal(receivedData.primaryCustomerId, 10);
  assert.equal(receivedData.managerId, 2);
  assert.equal(receivedData.candidateId, 1);

  assert.deepEqual(receivedData.selectedData, {
    full_name: 'Nguyen Van An',
    phone: '0912345670',
    email: 'an@example.com',
    address: 'Ca Mau'
  });

  assert.equal(result.customer.phone, '0912345670');
});
