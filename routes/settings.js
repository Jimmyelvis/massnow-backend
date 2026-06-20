const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, update, remove } = require('../controllers/category');  
const { getSettings, addFeaturedCategory, addArticlesToFeaturedCategory, addFeaturedColumnist } = require('../controllers/settings');

router.get('/settings/getsettings', getSettings);
router.post('/settings/featured-category', requireSignin, adminMiddleware, addFeaturedCategory);
router.post('/settings/featured-category/articles', requireSignin, adminMiddleware, addArticlesToFeaturedCategory); 
router.post('/settings/featured-columnist', requireSignin, adminMiddleware, addFeaturedColumnist);

module.exports = router;
