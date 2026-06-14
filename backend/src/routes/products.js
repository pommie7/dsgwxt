const { Router } = require('express');
const ctrl = require('../controllers/productController');

const router = Router();

// GET /api/products
router.get('/', ctrl.listProducts);

// GET /api/products/:id
router.get('/:id', ctrl.getProduct);

module.exports = router;
