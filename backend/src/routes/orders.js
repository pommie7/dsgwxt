const { Router } = require('express');
const ctrl = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { validate, createOrderRules, orderListRules } = require('../validators');

const router = Router();

// All order routes require authentication
router.use(auth);

// POST /api/orders
router.post('/', createOrderRules, validate, ctrl.createOrder);

// GET /api/orders
router.get('/', orderListRules, validate, ctrl.listOrders);

// GET /api/orders/:id
router.get('/:id', ctrl.getOrder);

module.exports = router;
