const config = require('../config');

/**
 * Global error-handling middleware (Express 4-argument signature).
 * Catches errors thrown or passed via next(err) in route handlers.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.message}`, config.nodeEnv === 'development' ? err.stack : '');

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: err.message || '服务器内部错误',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
