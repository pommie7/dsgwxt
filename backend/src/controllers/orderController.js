const { getDb } = require('../config/database');
const { generateOrderNo } = require('../utils/order');

/**
 * POST /api/orders
 * Create a new order. Requires authentication.
 */
function createOrder(req, res, next) {
  const db = getDb();
  const { items, receiver_name, receiver_phone, receiver_address, remark } = req.body;

  // Use a transaction so that order + order_items are atomic
  const create = db.transaction(() => {
    let totalAmount = 0;
    const orderItems = [];

    // Look up each product and compute subtotals
    for (const item of items) {
      const product = db.prepare(
        'SELECT id, name, price, stock, status FROM products WHERE id = ?'
      ).get([item.product_id]);

      if (!product) {
        throw Object.assign(new Error(`商品ID ${item.product_id} 不存在`), { statusCode: 404 });
      }
      if (product.status !== 1) {
        throw Object.assign(new Error(`商品 "${product.name}" 已下架`), { statusCode: 400 });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(
          new Error(`商品 "${product.name}" 库存不足，剩余 ${product.stock} 件`),
          { statusCode: 400 }
        );
      }

      const subtotal = +(product.price * item.quantity).toFixed(2);
      totalAmount += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    totalAmount = +totalAmount.toFixed(2);
    const orderNo = generateOrderNo();

    // Insert order
    const orderResult = db.prepare(
      'INSERT INTO orders (order_no, user_id, total_amount, status, receiver_name, receiver_phone, receiver_address, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run([
      orderNo, req.user.id, totalAmount, 'pending',
      receiver_name || '', receiver_phone || '', receiver_address || '', remark || '',
    ]);

    const orderId = orderResult.lastInsertRowid;

    // Insert order items and update stock
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const oi of orderItems) {
      insertItem.run([orderId, oi.product_id, oi.product_name, oi.product_price, oi.quantity, oi.subtotal]);
      updateStock.run([oi.quantity, oi.product_id]);
    }

    return { orderId, orderNo, totalAmount, items: orderItems };
  });

  try {
    const result = create();
    res.status(201).json({
      code: 201,
      message: '订单创建成功',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders
 * List orders for the authenticated user with pagination.
 */
function listOrders(req, res, next) {
  try {
    const db = getDb();
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const status = req.query.status || '';

    const conditions = ['user_id = ?'];
    const params = [req.user.id];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM orders ${where}`
    ).get(params).count;

    const orders = db.prepare(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all([...params, pageSize, (page - 1) * pageSize]);

    // Fetch order items for each order
    const list = orders.map((order) => ({
      ...order,
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all([order.id]),
    }));

    res.json({
      code: 200,
      data: {
        list,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 * Get a single order by ID (only if owned by the authenticated user).
 */
function getOrder(req, res, next) {
  try {
    const db = getDb();
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).get([req.params.id, req.user.id]);

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all([order.id]);

    res.json({ code: 200, data: order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listOrders, getOrder };
