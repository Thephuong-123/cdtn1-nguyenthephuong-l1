
const express = require('express');
const router = express.Router();

const customerService = require('../services/customer.service');
const { authenticate } = require('../middleware/auth.middleware');
const {
  requireCustomerWriteAccess
} = require('../middleware/customer-authorization.middleware');

// T01 - Bat buoc dang nhap cho tat ca API khach hang.
router.use(authenticate);

// GET /api/customers
// GET /api/customers?phone=0901234567
router.get('/', async (req, res, next) => {
  try {
    const { phone } = req.query;

    if (phone !== undefined) {
      const customer = await customerService.getCustomerByPhone(phone);
      return res.status(200).json(customer);
    }

    const customers = await customerService.getAllCustomers();
    return res.status(200).json(customers);

  } catch (error) {
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

    return res.status(200).json(customer);

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
    // Lay ID nguoi tao tu JWT, khong tin created_by cua client.
    const customerData = {
      ...req.body,
      created_by: req.user.user_id
    };

    const customer = await customerService.createCustomer(customerData);

    return res.status(201).json(customer);

  } catch (error) {
    if (error.message === 'INVALID_CUSTOMER_DATA') {
      return res.status(400).json({
        error: 'INVALID_CUSTOMER_DATA',
        message: 'Thông tin khách hàng không hợp lệ.'
      });
    }

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
// T02 - Kiem tra quyen so huu truoc khi cap nhat.
router.patch(
  '/:id',
  requireCustomerWriteAccess,
  async (req, res, next) => {
    try {
      const customer = await customerService.updateCustomer(
        req.params.id,
        req.body
      );

      return res.status(200).json(customer);

    } catch (error) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(404).json({
          error: 'CUSTOMER_NOT_FOUND',
          message: 'Không tìm thấy hồ sơ khách hàng.'
        });
      }

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
  }
);

// DELETE /api/customers/:id
// T02 - Kiem tra quyen so huu truoc khi xoa mem.
router.delete(
  '/:id',
  requireCustomerWriteAccess,
  async (req, res, next) => {
    try {
      const customer = await customerService.deactivateCustomer(
        req.params.id
      );

      return res.status(200).json({
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
  }
);

module.exports = router;
