
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { randomUUID } = require('node:crypto');

const requestIdMiddleware = require('../src/middleware/request-id.middleware');
const requestLoggerMiddleware = require('../src/middleware/request-logger.middleware');
const errorHandlerMiddleware = require('../src/middleware/error-handler.middleware');

test('TC08 - Error Handler tra ve HTTP 500 va requestId', async () => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // Route gia lap loi - chi ton tai trong bai test
  app.get('/test-error', (req, res, next) => {
    next(new Error('SIMULATED_TEST_ERROR'));
  });

  app.use(errorHandlerMiddleware);

  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));

    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/test-error`
    );

    assert.equal(response.status, 500);

    const body = await response.json();

    assert.deepEqual(body, {
      error: 'INTERNAL_SERVER_ERROR'
    });

    const requestId = response.headers.get('x-request-id');

    assert.ok(requestId);
    assert.doesNotThrow(() => randomUUID ? assert.match(
      requestId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    ) : null);

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
