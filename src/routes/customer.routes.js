
const express = require('express');
const router = express.Router();

const customerService = require('../services/customer.service');

// GET /api/customers
// GET /api/customers?phone=0901234567
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;

    if (phone) {
      const customer = await customerService.getCustomerByPhone(phone);
      return res.json(customer);
    }

    const customers = await customerService.getAllCustomers();
    return res.json(customers);

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND'
      });
    }

    console.error('Get customers error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    return res.json(customer);

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND'
      });
    }

    console.error('Get customer by ID error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
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

    // Trùng số điện thoại do Service phát hiện
    // hoặc do PostgreSQL UNIQUE phát hiện (23505)
    if (
      error.message === 'PHONE_ALREADY_EXISTS' ||
      error.code === '23505'
    ) {
      return res.status(409).json({
        error: 'PHONE_ALREADY_EXISTS',
        message: 'Số điện thoại đã tồn tại trong hệ thống.'
      });
    }

    console.error('Create customer error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// PATCH /api/customers/:id
router.patch('/:id', async (req, res) => {
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

    // PostgreSQL mã 23505: vi phạm ràng buộc UNIQUE
    // Ví dụ: cập nhật số điện thoại trùng hồ sơ khác
    if (
      error.code === '23505' ||
      error.message === 'PHONE_ALREADY_EXISTS'
    ) {
      return res.status(409).json({
        error: 'PHONE_ALREADY_EXISTS',
        message: 'Số điện thoại đã tồn tại trong hệ thống. Vui lòng sử dụng số điện thoại khác.'
      });
    }

    console.error('Update customer error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// DELETE /api/customers/:id
// Xóa mềm bằng is_active = FALSE
router.delete('/:id', async (req, res) => {
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

    console.error('Deactivate customer error:', error.message);

    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
