function errorHandlerMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const response = {
    error: err.publicCode || 'INTERNAL_SERVER_ERROR'
  };

  if (err.publicMessage) {
    response.message = err.publicMessage;
  }

  return res.status(500).json(response);
}

module.exports = errorHandlerMiddleware;
