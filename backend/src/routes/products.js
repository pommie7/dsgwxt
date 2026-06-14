const { Router } = require('express');
const ctrl = require('../controllers/productController');
const {
  validate,
  productAddRules,
  productUpdateRules,
  productDeleteRules,
  productQueryRules,
} = require('../validators');

const router = Router();

// ---- 查询 ----
// GET /api/products/query             — 分页查询列表
// GET /api/products/query/:id         — 按ID查询单个
router.get('/query', productQueryRules, validate, ctrl.queryProducts);
router.get('/query/:id', ctrl.queryProductById);

// ---- 新增 ----
// POST /api/products/add
router.post('/add', productAddRules, validate, ctrl.addProduct);

// ---- 修改 ----
// PUT /api/products/update/:id
router.put('/update/:id', productUpdateRules, validate, ctrl.updateProduct);

// ---- 删除 (下架) ----
// DELETE /api/products/delete/:id
router.delete('/delete/:id', productDeleteRules, validate, ctrl.deleteProduct);

module.exports = router;
