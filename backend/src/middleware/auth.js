const { verifyToken } = require('../utils/jwt');
const config = require('../config');

/**
 * JWT authentication middleware.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      code: 401,
      message: '认证令牌格式错误，请使用 Bearer <token>',
    });
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效或已过期，请重新登录',
    });
  }

  req.user = decoded;
  next();
}

module.exports = authMiddleware;
