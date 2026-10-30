
function requestLoggerMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs =
      Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const log = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : 'info',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs)
    };

    process.stdout.write(JSON.stringify(log) + '\n');
  });

  next();
}

module.exports = requestLoggerMiddleware;
