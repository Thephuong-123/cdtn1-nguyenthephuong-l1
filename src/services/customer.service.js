
const customerRepository = require('../repositories/customer.repository');

async function getAllCustomers() {
  return await customerRepository.findAll();
}

async function getCustomerById(id) {
  const customer = await customerRepository.findById(id);

  if (!customer) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  return customer;
}

async function getCustomerByPhone(phone) {
  // BUG-003: Kiem tra dinh dang SDT truoc khi truy van database.
  // SDT phai co dung 10 chu so va bat dau bang so 0.
  if (
    typeof phone !== 'string' ||
    !/^0\d{9}$/.test(phone)
  ) {
    throw new Error('INVALID_CUSTOMER_DATA');
  }

  const customer = await customerRepository.findByPhone(phone);

  if (!customer) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  return customer;
}

async function createCustomer(data) {
  // BUG-002: Kiem tra du lieu bat buoc va dinh dang SDT theo BR2.
  // SDT phai co dung 10 chu so va bat dau bang so 0.
  if (
    !data ||
    typeof data.full_name !== 'string' ||
    !data.full_name.trim() ||
    typeof data.phone !== 'string' ||
    !/^0\d{9}$/.test(data.phone)
  ) {
    throw new Error('INVALID_CUSTOMER_DATA');
  }

  const existingCustomer = await customerRepository.findByPhone(data.phone);

  if (existingCustomer) {
    throw new Error('PHONE_ALREADY_EXISTS');
  }

  return await customerRepository.createCustomer(data);
}

async function updateCustomer(id, data) {
  const existingCustomer = await customerRepository.findById(id);

  if (!existingCustomer) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  return await customerRepository.updateCustomer(id, data);
}

async function deactivateCustomer(id) {
  const existingCustomer = await customerRepository.findById(id);

  if (!existingCustomer) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  return await customerRepository.deactivateCustomer(id);
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deactivateCustomer
};
