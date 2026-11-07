
const express = require('express');
const router = express.Router();

const customerService = require('../services/customer.service');

// GET /api/customers
// GET /api/customers?phone=0901234567
router.get('/', async (req, res, next) => {
  try {
    const { phone } = req.query;

    if (phone) {
      const customer = await customerService.getCustomerByPhone(phone);
      return res.json(customer);
    }

    const customers = await customerService.getAllCustomers();
    return res.json(customers);

  } catch (error) {
    // BUG-003: Tra ve HTTP 400 neu SDT tra cuu sai dinh dang.
    if (error.message === 'INVALID_CUSTOMER_DATA') {
      return res.status(400).json({
        error: 'INVALID_CUSTOMER_DATA',
        message: 'Số điện thoại không hợp lệ.'
      });
    }

    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND'
      });
    }

    return next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    return res.json(customer);

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND'
      });
    }

    return next(error);
  }
});

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);

    return res.status(201).json(customer);

  } catch (error) {
    if (error.message === 'INVALID_CUSTOMER_DATA') {
      return res.status(400).json({
        error: 'INVALID_CUSTOMER_DATA',
        message: 'Thông tin khách hàng không hợp lệ.'
      });
    }

    // Trung so dien thoai do Service phat hien
    // hoac do PostgreSQL UNIQUE phat hien (23505).
    if (
      error.message === 'PHONE_ALREADY_EXISTS' ||
      error.code === '23505'
    ) {
      return res.status(409).json({
        error: 'PHONE_ALREADY_EXISTS',
        message: 'Số điện thoại đã tồn tại trong hệ thống.'
      });
    }

    return next(error);
  }
});

// PATCH /api/customers/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id,
      req.body
    );

    return res.json(customer);

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ khách hàng.'
      });
    }

    // PostgreSQL ma 23505: vi pham rang buoc UNIQUE.
    if (
      error.code === '23505' ||
      error.message === 'PHONE_ALREADY_EXISTS'
    ) {
      return res.status(409).json({
        error: 'PHONE_ALREADY_EXISTS',
        message: 'Số điện thoại đã tồn tại trong hệ thống. Vui lòng sử dụng số điện thoại khác.'
      });
    }

    return next(error);
  }
});

// DELETE /api/customers/:id
// Xoa mem bang is_active = FALSE
router.delete('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.deactivateCustomer(req.params.id);

    return res.json({
      message: 'CUSTOMER_DEACTIVATED',
      customer
    });

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND'
      });
    }

    return next(error);
  }
});

module.exports = router;
