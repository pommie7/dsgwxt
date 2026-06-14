const { Router } = require('express');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../validators');

const router = Router();

// POST /api/auth/register
router.post('/register', registerRules, validate, ctrl.register);

// POST /api/auth/login
router.post('/login', loginRules, validate, ctrl.login);

// GET /api/auth/profile (protected)
router.get('/profile', auth, ctrl.getProfile);

module.exports = router;
