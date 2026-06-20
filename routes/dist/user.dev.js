"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/auth'),
    requireSignin = _require.requireSignin,
    authMiddleware = _require.authMiddleware,
    adminMiddleware = _require.adminMiddleware; // validators


var _require2 = require('../validators'),
    runValidation = _require2.runValidation;

var _require3 = require('../validators/auth'),
    userSignupValidator = _require3.userSignupValidator,
    userSigninValidator = _require3.userSigninValidator;

var _require4 = require("../controllers/user"),
    read = _require4.read,
    publicProfile = _require4.publicProfile,
    update = _require4.update,
    allusers = _require4.allusers,
    oneUser = _require4.oneUser,
    changeUser = _require4.changeUser,
    getAuthors = _require4.getAuthors,
    createUser = _require4.createUser,
    getBlogsByAuthor = _require4.getBlogsByAuthor;

router.get('/user/profile', requireSignin, authMiddleware, read);
router.get("/user/blogs/:userId", getBlogsByAuthor);
router.get('/user/:username', publicProfile);
router.put("/user/update", requireSignin, authMiddleware, update);
router.post("/user/admin/oneuser", requireSignin, authMiddleware, oneUser);
router.put("/user/admin/changeuser", requireSignin, authMiddleware, changeUser);
router.get("/users/allusers", allusers);
router.get("/users/authors", getAuthors);
router.post("/user/create", requireSignin, adminMiddleware, userSignupValidator, runValidation, createUser); // router.get("/user/photo/:username", photo);

module.exports = router;