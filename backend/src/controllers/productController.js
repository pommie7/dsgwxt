const { getDb } = require('../config/database');
const Result = require('../utils/result');

/**
 * ============================================================
 * 商品管理控制器 — RESTful CRUD
 * ============================================================
 *
 * 接口路径:
 *   GET    /api/products/query        — 分页查询商品列表
 *   GET    /api/products/query/:id    — 查询单个商品
 *   POST   /api/products/add          — 新增商品
 *   PUT    /api/products/update/:id   — 修改商品
 *   DELETE /api/products/delete/:id   — 删除商品(下架)
 */

// ==================== 1. 查询 ====================

/**
 * GET /api/products/query
 * 分页查询商品列表 + 分类筛选 + 关键词搜索
 */
function queryProducts(req, res, next) {
  try {
    const db = getDb();
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';
    const status = req.query.status !== undefined ? parseInt(req.query.status, 10) : 1;

    // 动态构建 WHERE 条件
    const conditions = [];
    const params = [];

    if (status !== undefined && status !== null && req.query.status !== '') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 总数
    const total = db.prepare(
      `SELECT COUNT(*) as cnt FROM products ${where}`
    ).get(params).cnt;

    // 分页数据
    const rows = db.prepare(
      `SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
    ).all([...params, pageSize, (page - 1) * pageSize]);

    res.json(Result.page(rows, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/query/:id
 * 按 ID 查询单个商品详情
 */
function queryProductById(req, res, next) {
  try {
    const db = getDb();
    const product = db.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).get([req.params.id]);

    if (!product) {
      return res.status(404).json(Result.notFound('商品不存在'));
    }

    res.json(Result.success(product));
  } catch (err) {
    next(err);
  }
}

// ==================== 2. 新增 ====================

/**
 * POST /api/products/add
 * 新增商品
 */
function addProduct(req, res, next) {
  try {
    const db = getDb();
    const { name, description, price, stock, category, image_url } = req.body;

    const result = db.prepare(`
      INSERT INTO products (name, description, price, stock, category, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run([
      name,
      description || '',
      parseFloat(price),
      parseInt(stock) || 0,
      category || '',
      image_url || '',
    ]);

    const newProduct = db.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).get([result.lastInsertRowid]);

    res.status(201).json(Result.created(newProduct, '商品添加成功'));
  } catch (err) {
    next(err);
  }
}

// ==================== 3. 修改 ====================

/**
 * PUT /api/products/update/:id
 * 修改商品信息（部分更新）
 */
function updateProduct(req, res, next) {
  try {
    const db = getDb();
    const id = req.params.id;

    // 检查商品是否存在
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
    if (!existing) {
      return res.status(404).json(Result.notFound('商品不存在'));
    }

    const { name, description, price, stock, category, image_url, status } = req.body;

    // 构建动态 UPDATE SET 子句
    const setClauses = [];
    const setParams = [];

    if (name !== undefined) {
      setClauses.push('name = ?'); setParams.push(name);
    }
    if (description !== undefined) {
      setClauses.push('description = ?'); setParams.push(description);
    }
    if (price !== undefined) {
      setClauses.push('price = ?'); setParams.push(parseFloat(price));
    }
    if (stock !== undefined) {
      setClauses.push('stock = ?'); setParams.push(parseInt(stock));
    }
    if (category !== undefined) {
      setClauses.push('category = ?'); setParams.push(category);
    }
    if (image_url !== undefined) {
      setClauses.push('image_url = ?'); setParams.push(image_url);
    }
    if (status !== undefined) {
      setClauses.push('status = ?'); setParams.push(parseInt(status));
    }

    if (setClauses.length === 0) {
      return res.status(400).json(Result.businessError('没有需要更新的字段'));
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`;
    setParams.push(id);

    db.prepare(sql).run(setParams);

    // 返回更新后的数据
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
    res.json(Result.success(updated, '商品修改成功'));
  } catch (err) {
    next(err);
  }
}

// ==================== 4. 删除(下架) ====================

/**
 * DELETE /api/products/delete/:id
 * 删除商品（软删除: 将 status 设为 0 表示下架）
 */
function deleteProduct(req, res, next) {
  try {
    const db = getDb();
    const id = req.params.id;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
    if (!existing) {
      return res.status(404).json(Result.notFound('商品不存在'));
    }

    if (existing.status === 0) {
      return res.status(400).json(Result.businessError('商品已下架，无需重复操作'));
    }

    // 软删除：status = 0 表示下架
    db.prepare('UPDATE products SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run([id]);

    res.json(Result.success(null, '商品已下架'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  queryProducts,
  queryProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
