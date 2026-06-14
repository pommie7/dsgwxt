const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('./index');

let db = null;
let _dbInstance = null; // raw sql.js instance for save

// Ensure data directory exists
const dbDir = path.dirname(config.db.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * Create a friendly wrapper around sql.js that resembles better-sqlite3 API.
 * Uses positional (?) parameters only.
 */
function createWrapper(dbInstance) {
  return {
    _raw: dbInstance,

    exec(sql) {
      dbInstance.run(sql);
    },

    prepare(sql) {
      // Store SQL string; create a fresh statement on every call so
      // the returned methods are safely reusable (unlike raw sql.js).
      return {
        _sql: sql,
        all(params = []) {
          const stmt = dbInstance.prepare(sql);
          const arr = Array.isArray(params) ? params : [params];
          stmt.bind(arr);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },
        get(params = []) {
          const stmt = dbInstance.prepare(sql);
          const arr = Array.isArray(params) ? params : [params];
          stmt.bind(arr);
          let row = undefined;
          if (stmt.step()) {
            row = stmt.getAsObject();
          }
          stmt.free();
          return row;
        },
        run(params = []) {
          const stmt = dbInstance.prepare(sql);
          const arr = Array.isArray(params) ? params : [params];
          stmt.bind(arr);
          stmt.step();
          stmt.free();
          // Query last_insert_rowid
          const result = dbInstance.exec('SELECT last_insert_rowid() as id');
          let id = 0;
          if (result.length > 0 && result[0].values.length > 0) {
            id = result[0].values[0][0];
          }
          const changes = dbInstance.getRowsModified();
          return { changes, lastInsertRowid: id };
        },
      };
    },

    transaction(fn) {
      return (...args) => {
        this.exec('BEGIN TRANSACTION');
        try {
          const result = fn(...args);
          this.exec('COMMIT');
          return result;
        } catch (err) {
          this.exec('ROLLBACK');
          throw err;
        }
      };
    },

    close() {
      dbInstance.close();
    },
  };
}

/**
 * Initialize database tables and seed data.
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(config.db.path)) {
    const fileBuffer = fs.readFileSync(config.db.path);
    _dbInstance = new SQL.Database(fileBuffer);
  } else {
    _dbInstance = new SQL.Database();
  }

  db = createWrapper(_dbInstance);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      address TEXT DEFAULT '',
      role VARCHAR(20) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      price DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      category VARCHAR(50) DEFAULT '',
      image_url VARCHAR(500) DEFAULT '',
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no VARCHAR(32) UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      receiver_name VARCHAR(50) DEFAULT '',
      receiver_phone VARCHAR(20) DEFAULT '',
      receiver_address TEXT DEFAULT '',
      remark TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name VARCHAR(200) NOT NULL,
      product_price DECIMAL(10,2) NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);

  // Seed sample products if the table is empty
  const row = db.prepare('SELECT COUNT(*) as cnt FROM products').get();
  if (row && row.cnt === 0) {
    seedProducts();
  }

  return db;
}

function seedProducts() {
  const products = [
    ['iPhone 15 Pro Max', 'Apple iPhone 15 Pro Max 256GB 原色钛金属', 9999.00, 100, '手机数码', '/images/iphone15.jpg'],
    ['MacBook Pro 14"', 'Apple MacBook Pro 14英寸 M3 Pro芯片 18GB/512GB', 14999.00, 50, '电脑办公', '/images/macbook.jpg'],
    ['AirPods Pro 2', 'Apple AirPods Pro 第二代 USB-C接口', 1899.00, 200, '手机数码', '/images/airpods.jpg'],
    ['Sony WH-1000XM5', '索尼 WH-1000XM5 无线降噪头戴式耳机', 2499.00, 80, '手机数码', '/images/sony.jpg'],
    ['iPad Air M2', 'Apple iPad Air M2芯片 11英寸 128GB', 4799.00, 60, '电脑办公', '/images/ipad.jpg'],
    ['华为 Mate 60 Pro', '华为 Mate 60 Pro 12GB+512GB 雅丹黑', 6999.00, 30, '手机数码', '/images/mate60.jpg'],
    ['小米14 Ultra', '小米14 Ultra 16GB+512GB 徕卡光学镜头', 5999.00, 45, '手机数码', '/images/xiaomi14.jpg'],
    ['Dell U2723QE', '戴尔 27英寸 4K USB-C显示器', 3499.00, 25, '电脑办公', '/images/dell.jpg'],
  ];

  const insert = db.prepare(
    'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertAll = db.transaction((items) => {
    for (const item of items) {
      insert.run(item);
    }
  });

  insertAll(products);
  console.log(`[Seed] Inserted ${products.length} sample products`);
}

/**
 * Persist database to disk.
 */
function saveDatabase() {
  if (_dbInstance) {
    const data = _dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(config.db.path, buffer);
  }
}

module.exports = { initDatabase, saveDatabase, getDb: () => db };
