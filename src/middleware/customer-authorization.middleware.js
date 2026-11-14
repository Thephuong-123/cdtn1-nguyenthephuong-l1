
const customerService = require('../services/customer.service');

// Kiem tra quyen sua hoac xoa mot ho so khach hang.
async function requireCustomerWriteAccess(req, res, next) {
  try {
    // Middleware authenticate phai chay truoc.
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập.'
      });
    }

    const customer = await customerService.getCustomerById(
      req.params.id
    );

    // Quan ly duoc phep thao tac tren moi ho so.
    if (req.user.role === 'MANAGER') {
      return next();
    }

    // Nhan vien chi duoc sua ho so do minh tao.
    const isOwner =
      req.user.role === 'SALES' &&
      customer.created_by != null &&
      Number(customer.created_by) === Number(req.user.user_id);

    if (!isOwner) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Bạn không có quyền thay đổi hồ sơ này.'
      });
    }

    return next();

  } catch (error) {
    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ khách hàng.'
      });
    }

    return next(error);
  }
}

module.exports = {
  requireCustomerWriteAccess
};
