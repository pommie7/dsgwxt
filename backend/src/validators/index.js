const { body, query, param, validationResult } = require('express-validator');
const Result = require('../utils/result');

/**
 * Middleware factory: validates the request and returns 422 on failure.
 * Place after your validation chain in the route definition.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(
      Result.validationError(
        '参数校验失败',
        errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        }))
      )
    );
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

// ---- Product CRUD validators ----

const productAddRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('商品名称不能为空')
    .isLength({ max: 200 }).withMessage('商品名称不超过200字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('商品描述不超过500字符'),
  body('price')
    .notEmpty().withMessage('商品价格不能为空')
    .isDecimal({ min: '0.01' }).withMessage('价格必须大于0'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('库存不能为负数'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('分类名不超过50字符'),
  body('image_url')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('图片URL不超过500字符'),
];

const productUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('商品ID必须为正整数'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('商品名称不超过200字符'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('商品描述不超过500字符'),
  body('price')
    .optional()
    .isDecimal({ min: '0.01' }).withMessage('价格必须大于0'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('库存不能为负数'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('分类名不超过50字符'),
  body('status')
    .optional()
    .isIn([0, 1]).withMessage('状态值必须为0或1'),
];

const productDeleteRules = [
  param('id').isInt({ min: 1 }).withMessage('商品ID必须为正整数'),
];

const productQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页条数须在1-100之间'),
  query('category')
    .optional()
    .trim(),
  query('keyword')
    .optional()
    .trim(),
  query('status')
    .optional()
    .isIn(['0', '1', '']).withMessage('状态值不合法'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createOrderRules,
  orderListRules,
  productAddRules,
  productUpdateRules,
  productDeleteRules,
  productQueryRules,
};
