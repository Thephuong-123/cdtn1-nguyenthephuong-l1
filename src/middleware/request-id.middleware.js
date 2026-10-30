
const { randomUUID } = require('node:crypto');

function requestIdMiddleware(req, res, next) {
  req.requestId = randomUUID();

  // Cho phep doi chieu request voi log khi kiem thu
  res.setHeader('X-Request-Id', req.requestId);

  next();
}

module.exports = requestIdMiddleware;
