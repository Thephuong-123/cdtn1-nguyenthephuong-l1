const test = require('node:test');
const assert = require('node:assert/strict');

const customerService = require('../src/services/customer.service');
const customerRepository = require('../src/repositories/customer.repository');

test('BT3-TC-06 - Tu choi tra cuu SDT khong hop le', async (t) => {
  const findByPhone = t.mock.method(
    customerRepository,
    'findByPhone',
    async () => undefined
  );

  await assert.rejects(
    customerService.getCustomerByPhone('123'),
    { message: 'INVALID_CUSTOMER_DATA' }
  );

  assert.equal(
    findByPhone.mock.callCount(),
    0,
    'SDT sai dinh dang khong duoc truy van database'
  );
});
