const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware factory: validates the request and returns 422 on failure.
 * Place after your validation chain in the route definition.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      code: 422,
      message: '参数校验失败',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
}

// ---- Auth validators ----

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度须在3-50个字符之间'),
  body('password')
    .isLength({ min: 6, max: 255 })
    .withMessage('密码长度须在6-255个字符之间'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

// ---- Order validators ----

const createOrderRules = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('订单商品不能为空'),
  body('items.*.product_id')
    .isInt({ min: 1 })
    .withMessage('商品ID必须为正整数'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('商品数量必须大于0'),
  body('receiver_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }),
  body('receiver_phone')
    .optional()
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确'),
  body('receiver_address')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }),
];

const orderListRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须为正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页条数须在1-100之间'),
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'shipped', 'completed', 'cancelled'])
    .withMessage('订单状态不合法'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createOrderRules,
  orderListRules,
};
