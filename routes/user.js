const express = require('express');
const router = express.Router();
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth');
const { read, publicProfile, update, allusers, oneUser, changeUser } = require("../controllers/user");


router.get('/user/profile', requireSignin, authMiddleware, read);
router.get('/user/:username', publicProfile);
router.put("/user/update", requireSignin, authMiddleware, update);
router.post("/user/admin/oneuser", requireSignin, authMiddleware, oneUser);
router.put("/user/admin/changeuser", requireSignin, authMiddleware, changeUser);
router.get("/users/allusers", allusers);
// router.get("/user/photo/:username", photo);




module.exports = router;