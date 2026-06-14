const { getDb } = require('../config/database');

/**
 * GET /api/products
 * List products with optional category filter and pagination.
 */
function listProducts(req, res, next) {
  try {
    const db = getDb();
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';

    const conditions = ['status = 1'];
    const params = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM products ${where}`
    ).get(params).count;

    const rows = db.prepare(
      `SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
    ).all([...params, pageSize, (page - 1) * pageSize]);

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
function getProduct(req, res, next) {
  try {
    const db = getDb();
    const product = db.prepare(
      'SELECT * FROM products WHERE id = ? AND status = 1'
    ).get([req.params.id]);

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在或已下架',
      });
    }

    res.json({ code: 200, data: product });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct };
