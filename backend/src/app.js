const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { initDatabase, saveDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

async function main() {
  // --- Initialize database ---
  await initDatabase();

  const app = express();

  // --- Global middleware ---
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // --- Health check ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- API routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  // --- 404 catch-all ---
  app.use((_req, res) => {
    res.status(404).json({ code: 404, message: '接口不存在' });
  });

  // --- Error handler (must be last) ---
  app.use(errorHandler);

  // --- Start server ---
  app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });

  // --- Persist database on exit ---
  process.on('exit', saveDatabase);
  process.on('SIGINT', () => { saveDatabase(); process.exit(0); });
  process.on('SIGTERM', () => { saveDatabase(); process.exit(0); });

  return app;
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
