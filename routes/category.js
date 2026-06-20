const express = require('express');
const router = express.Router();
const { create, list, read, read_v2,
  remove, listWithBlogsCount, update } = require('../controllers/category');


// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read_v2);
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);
router.put('/category/update/:id', requireSignin, adminMiddleware, update);
router.get('/categories/blogs/count', listWithBlogsCount);

module.exports = router;
