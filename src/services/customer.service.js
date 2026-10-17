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
  const customer = await customerRepository.findByPhone(phone);

  if (!customer) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  return customer;
}

async function createCustomer(data) {
  if (!data.full_name || !data.phone) {
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