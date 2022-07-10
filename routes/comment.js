const express = require("express");
const { create, listFromArticle, commentsFromUser, createReply, repliesFromUser, singleComment, createRecomended } = require("../controllers/comments");
const router = express.Router();


router.post("/comment", create);
router.post("/comments", listFromArticle);
router.get("/commentsFromUser", commentsFromUser);
router.get("/comments/repliesFromUser", repliesFromUser);
router.post("/comments/createreply", createReply);
router.get("/comments/single", singleComment)
router.post("/comments/createrecomended", createRecomended);




module.exports = router;
