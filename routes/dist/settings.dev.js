"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/auth'),
    requireSignin = _require.requireSignin,
    adminMiddleware = _require.adminMiddleware;

var _require2 = require('../controllers/category'),
    create = _require2.create,
    list = _require2.list,
    read = _require2.read,
    update = _require2.update,
    remove = _require2.remove;

var _require3 = require('../controllers/settings'),
    getSettings = _require3.getSettings,
    addFeaturedCategory = _require3.addFeaturedCategory,
    addArticlesToFeaturedCategory = _require3.addArticlesToFeaturedCategory,
    addFeaturedColumnist = _require3.addFeaturedColumnist;

router.get('/settings/getsettings', getSettings);
router.post('/settings/featured-category', requireSignin, adminMiddleware, addFeaturedCategory);
router.post('/settings/featured-category/articles', requireSignin, adminMiddleware, addArticlesToFeaturedCategory);
router.post('/settings/featured-columnist', requireSignin, adminMiddleware, addFeaturedColumnist);
module.exports = router;