
require('dotenv').config();

const express = require('express');

// Import Middleware
const requestIdMiddleware = require('./middleware/request-id.middleware');
const requestLoggerMiddleware = require('./middleware/request-logger.middleware');
const errorHandlerMiddleware = require('./middleware/error-handler.middleware');

// Import Routes
const customerRoutes = require('./routes/customer.routes');
const duplicateRoutes = require('./routes/duplicate.routes');
const mergeRoutes = require('./routes/merge.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware đọc dữ liệu JSON
app.use(express.json());

// Middleware tạo requestId cho mỗi HTTP request
app.use(requestIdMiddleware);

// Middleware ghi JSON log cho mỗi HTTP request
app.use(requestLoggerMiddleware);

// API kiểm tra trạng thái Backend
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API khách hàng - US1 đến US4
app.use('/api/customers', customerRoutes);

// API hồ sơ nghi trùng - US5 và US6
app.use('/api/duplicates', duplicateRoutes);

// API gộp hồ sơ khách hàng - US7
app.use('/api/merges', mergeRoutes);

// Middleware xử lý lỗi tập trung
app.use(errorHandlerMiddleware);

// Khởi động Backend
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
