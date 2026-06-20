"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/category'),
    create = _require.create,
    list = _require.list,
    read = _require.read,
    read_v2 = _require.read_v2,
    remove = _require.remove,
    listWithBlogsCount = _require.listWithBlogsCount,
    update = _require.update; // validators


var _require2 = require('../validators'),
    runValidation = _require2.runValidation;

var _require3 = require('../validators/category'),
    categoryCreateValidator = _require3.categoryCreateValidator;

var _require4 = require('../controllers/auth'),
    requireSignin = _require4.requireSignin,
    adminMiddleware = _require4.adminMiddleware;

router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/categories', list);
router.get('/category/:slug', read_v2);
router["delete"]('/category/:slug', requireSignin, adminMiddleware, remove);
router.put('/category/update/:id', requireSignin, adminMiddleware, update);
router.get('/categories/blogs/count', listWithBlogsCount);
module.exports = router;