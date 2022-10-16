const express = require("express");
const {
  create,
  listFromArticle,
  commentsFromUser,
  createReply,
  repliesFromUser,
  singleComment,
  createRecomended,
  listAll,
  allReplies,
} = require("../controllers/comments");
const router = express.Router();

router.post("/comment", create);
router.post("/comments", listFromArticle);
router.get("/comments/all", listAll);
router.get("/comments/allreplies", allReplies);
router.post("/commentsFromUser", commentsFromUser);
router.post("/comments/repliesFromUser", repliesFromUser);
router.post("/comments/createreply", createReply);
router.post("/comments/single", singleComment);
router.post("/comments/createrecomended", createRecomended);

module.exports = router;
