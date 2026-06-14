const Result = require('../utils/result');
const config = require('../config');

/**
 * ============================================================
 * 全局异常处理器
 * ============================================================
 *
 * 处理以下异常类型:
 *   - 参数校验失败    (express-validator)  → 422
 *   - 业务异常        (BusinessError)      → 400
 *   - 资源不存在      (NotFoundError)      → 404
 *   - 未知异常        (Error)              → 500
 */

// 自定义业务异常类
class BusinessError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = code;
  }
}

// 自定义资源不存在异常
class NotFoundError extends Error {
  constructor(message = '资源不存在') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// 自定义参数校验异常
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;
    this.errors = errors;
  }
}

/**
 * Express 全局错误处理中间件
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const isDev = config.nodeEnv === 'development';

  // 记录日志
  console.error(`[${err.name || 'Error'}] ${err.message}`);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  // 1. 参数校验异常 (express-validator)
  if (err.name === 'ValidationError') {
    return res.status(422).json(
      Result.validationError(err.message, err.errors)
    );
  }

  // 2. 业务异常
  if (err.name === 'BusinessError') {
    return res.status(err.statusCode || 400).json(
      Result.businessError(err.message)
    );
  }

  // 3. 资源不存在
  if (err.name === 'NotFoundError') {
    return res.status(404).json(
      Result.notFound(err.message)
    );
  }

  // 4. 请求体 JSON 解析失败
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(
      Result.businessError('请求体 JSON 格式错误')
    );
  }

  // 5. 未知异常 → 500
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? '服务器内部错误' : err.message;

  res.status(statusCode).json(
    Result.fail(statusCode, message, isDev ? { stack: err.stack } : null)
  );
}

module.exports = {
  errorHandler,
  BusinessError,
  NotFoundError,
  ValidationError,
};
