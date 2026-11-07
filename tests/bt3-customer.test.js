const test = require('node:test');
const assert = require('node:assert/strict');

const customerService = require('../src/services/customer.service');
const customerRepository = require('../src/repositories/customer.repository');

const validCustomer = {
  full_name: 'Nguyen Van Test',
  phone: '0912345670',
  email: 'test@example.com',
  address: 'Ca Mau',
  created_by: 1
};

test('BT3-TC-01 - Tao khach hang hop le', async (t) => {
  t.mock.method(customerRepository, 'findByPhone', async () => undefined);
  t.mock.method(customerRepository, 'createCustomer', async data => ({
    customer_id: 100,
    ...data
  }));

  const result = await customerService.createCustomer(validCustomer);

  assert.equal(result.customer_id, 100);
  assert.equal(result.phone, '0912345670');
});

test('BT3-TC-02 - Tu choi so dien thoai da ton tai', async (t) => {
  t.mock.method(customerRepository, 'findByPhone', async () => ({
    customer_id: 1,
    phone: '0912345670'
  }));

  t.mock.method(customerRepository, 'createCustomer', async () => {
    throw new Error('SHOULD_NOT_CREATE');
  });

  await assert.rejects(
    customerService.createCustomer(validCustomer),
    { message: 'PHONE_ALREADY_EXISTS' }
  );
});

test('BT3-TC-03 - Chap nhan SDT dung 10 chu so', async (t) => {
  t.mock.method(customerRepository, 'findByPhone', async () => undefined);
  t.mock.method(customerRepository, 'createCustomer', async data => ({
    customer_id: 101,
    ...data
  }));

  const result = await customerService.createCustomer({
    ...validCustomer,
    phone: '0912345671'
  });

  assert.equal(result.phone, '0912345671');
});

test('BT3-TC-04 - Tu choi SDT chi co 9 chu so', async (t) => {
  t.mock.method(customerRepository, 'findByPhone', async () => undefined);
  t.mock.method(customerRepository, 'createCustomer', async data => ({
    customer_id: 102,
    ...data
  }));

  await assert.rejects(
    customerService.createCustomer({
      ...validCustomer,
      phone: '091234567'
    }),
    { message: 'INVALID_CUSTOMER_DATA' }
  );
});

test('BT3-TC-05 - Tu choi khach hang thieu ho ten', async (t) => {
  t.mock.method(customerRepository, 'createCustomer', async () => {
    throw new Error('SHOULD_NOT_CREATE');
  });

  await assert.rejects(
    customerService.createCustomer({
      ...validCustomer,
      full_name: ''
    }),
    { message: 'INVALID_CUSTOMER_DATA' }
  );
});
