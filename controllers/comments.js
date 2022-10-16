const Comment = require("../models/comments");
const Blog = require("../models/blog");
const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { result } = require("lodash");
const comments = require("../models/comments");

// exports.create = (req, res) => {
//   const user_id = req.body.user_id;
//   const post_id = req.body.post_id;
//   const body = req.body.body;
//   let commentAuthor;
//   let commentAvatar;
//   let commentUsername;
//   let blogSlug;

//   User.findById(user_id, (error, results) => {
//     if (error) {
//       res.json({
//         error: error,
//       });
//       console.log(error);
//     }

//     // commentAuthor = results.name;
//     // commentAvatar = results.avatar;
//     // commentUsername = results.username;

//     console.log("==================req.body.post_id==================");
//     console.log(req.body.post_id);
//     console.log('====================================');

//     Blog.findById(post_id, (error, results) => {
//       if (error) {
//         res.json({
//           error: error,
//         });
//         console.log(error);
//       }

//       let comment = new Comment();
//       comment.postedBy = user_id;
//       //  comment.avatar = commentAvatar
//       //  comment.username = commentUsername
//       comment.body = body;
//       comment.post = post_id;
//       comment.flagged = false;

//       console.log("what the fuck");

//       comment.save((error, result) => {
//         if (error) {
//           return res.status(400).json({
//             error: errorHandler(error),
//           });
//         }

//         console.log('===============result=====================');
//         console.log(result);
//         console.log('====================================');

//         res.json({
//           msg: "Comment Successfully Created",
//           comment: result
//         });
//       });
//     });
//   });
// };

exports.create = (req, res) => {
  const user_id = req.body.user_id;
  const post_id = req.body.post_id;
  const body = req.body.body;
  let commentAuthor;
  let commentAvatar;
  let commentUsername;
  let blogSlug;

  User.findById(user_id, (error, results) => {
    if (error) {
      res.json({
        error: error,
      });
      console.log(error);
    }

    let comment = new Comment();
    comment.postedBy = user_id;
    comment.body = body;
    comment.post = post_id;
    comment.flagged = false;

    comment.save((error, result) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      console.log("===============result=====================");
      console.log(result);
      console.log("====================================");

      Comment.findById(result._id)
        .populate("postedBy", "_id name username photo")
        .populate("replies.postedBy", "_id name username photo")
        .populate("recommended.recommendedBy", "_id name username photo")
        .populate("post", "_id slug mainphoto title")
        .exec((err, data) => {
          if (err) {
            return res.json({
              error: errorHandler(err),
            });
          }

          res.json({
            msg: "Comment Successfully Created",
            comment: data,
          });
        });
    });
  });
};

exports.listAll = (req, res) => {
  Comment.find({})
    .populate("postedBy", "_id name username photo")
    // .populate("post", "_id slug mainphoto title postedBy")
    .populate({path: "post", select:"_id slug mainphoto title subtitle", populate: {path: "postedBy", select: "_id name username photo"}})
    .populate("replies.postedBy", "_id name username photo")
    .populate("recommended.recommendedBy", "_id name username photo")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.listFromArticle = (req, res) => {
  const post_id = req.body.post_id;

  Comment.find({ post: post_id })
    .populate("postedBy", "_id name username photo")
    .populate("post", "_id slug mainphoto title")
    .populate("replies.postedBy", "_id name username photo")
    .populate("recommended.recommendedBy", "_id name username photo")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.commentsFromUser = (req, res) => {
  const user_id = req.body.user_id;

  Comment.find({ postedBy: user_id })
    .populate("postedBy", "_id name username photo")
    .populate("post", "_id slug mainphoto title")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      let comment = {};
      let comments = [];

      data.forEach((element) => {
        const { _id, body, ...other } = element;

        // console.log('================other====================');
        // console.log(other._doc);
        // console.log('====================================');

        let therest = other._doc;

        let { replies, ...theOthers } = therest;

        comment = {
          ...theOthers,
          repliesLength: element.replies.length,
        };

        comments.push(comment);

        /**
         * - Get the keys from each element and destructure,
         * - pull _doc from ...other so we get just the info we want,
         * - assign the results to therest variable,
         * - right now we don't need the replies array so use
         *   object destuctoring along with rest syntax to omit the array
         * - Create a new object from theOthers, along with get the length
         *   of the replies array then push to the comments array on each
         *   iteration
         *
         */
      });

      // console.log("==============comments======================");
      // console.log(comments);
      // console.log('====================================');

      res.json(comments);
    });
};

exports.createReply = (req, res) => {
  const user_id = req.body.user_id;
  const post_id = req.body.post_id;
  const body = req.body.body;
  const comment_id = req.body.comment_id;

  Comment.findById(comment_id)
    .populate("postedBy", "_id name username photo")
    .populate("post", "_id slug mainphoto title")
    .populate("replies.postedBy", "_id name username photo")
    .populate("recommended.recommendedBy", "_id name username photo")
    .exec((error, results) => {
      if (error) {
        res.json({
          error: error,
        });
        console.log(error);
      }

      const newReply = {
        postedBy: user_id,
        body: body,
        flagged: false,
        post: post_id,
      };

      results.replies.push(newReply);
      console.log(results);
      results.save((error, response) => {
        Comment.findById(comment_id)
          .populate("postedBy", "_id name username photo")
          .populate("post", "_id slug mainphoto title")
          .populate("replies.postedBy", "_id name username photo")
          .populate("recommended.recommendedBy", "_id name username photo")
          .exec((error, result) => {
            if (error) {
              res.json({
                error: error,
              });
              console.log(error);
            }

            res.json({
              msg: "Successfully Added Reply",
              comment: result,
            });
          });
      });
    });
};

exports.repliesFromUser = (req, res) => {
  const username = req.body.username;
  const user_id = req.body.user_id;

  let theReplies = [];

  Comment.find({ "replies.postedBy": user_id })
    .populate("replies.postedBy", "_id name username photo")
    .populate("post", "slug")
    .select("replies _id post")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      let entry = {};

      data.forEach((element) => {
        /**
         * Create a new object that contains all the info
         * from each reply, as well as the comment ID that the
         * reply is attached to and the post slug that the comment
         * is attached to
         */

        element.replies.forEach((elem) => {
          entry = {
            body: elem.body,
            postedBy: elem.postedBy,
            flagged: elem.flagged,
            date: elem.date,
            recommended: elem.recommended,
            slug: element.post.slug,
            comment_id: element._id,
          };

          theReplies.push(entry);
        });
      });

      res.json(
        theReplies.filter((elem) => {
          return elem.postedBy.username === username;
        })
      );
    });
};

exports.allReplies = (req, res) => {
  let theReplies = [];

  Comment.find({})
    .populate("replies.postedBy", "_id name username photo")
    .populate("post", "slug")
    .select("replies _id post")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      let entry = {};

      data.forEach((element) => {
        /**
         * Create a new object that contains all the info
         * from each reply, as well as the comment ID that the
         * reply is attached to and the post slug that the comment
         * is attached to
         */

        element.replies.forEach((elem) => {
          entry = {
            body: elem.body,
            postedBy: elem.postedBy,
            flagged: elem.flagged,
            date: elem.date,
            recommended: elem.recommended,
            slug: element.post.slug,
            comment_id: element._id,
          };

          theReplies.push(entry);
        });
      });

      res.json(theReplies);
    });
};

exports.singleComment = (req, res) => {
  const comment_id = req.body.comment_id;
  const flag = req.body.flag;

  /**
   * A flag will be sent from the client end to determine
   * what part of the comment info we want to receive
   */

  Comment.findById(comment_id)
    .populate("postedBy", "_id name username photo role email")
    .populate("replies.postedBy", "_id name username photo role")
    .populate("recommended.recommendedBy", "_id name username photo role")
    .populate("post", "_id slug mainphoto title subtitle")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      if (flag === "replies") {
        console.log(data.replies);
        res.json(data.replies);
      } else if (flag === "recommended") {
        console.log(data.recommended);
        res.json(data.recommended);
      } else {
        let commentInfo = {};

        /**
         * Get all the other comments that's attached the same article that this comment
         * is attached to. Done by find all comments whose post: key is equal to
         * data.post._id. If we get any results it will be put into the postComments
         * variable below.
         */
        Comment.find({ post: data.post._id })
          .populate("post", "_id slug mainphoto title")
          .populate("postedBy", "_id name username photo role email")
          .exec((err, postComments) => {
            if (err) {
              return res.json({
                error: errorHandler(err),
              });
            }

            /**
             * Go through all the users find thoses who has the article Id from
             * above in their favorite articles array. If we find any put then in the likes
             * variable below.
             */
            User.find({ "favorite_articles.post_id": data.post._id.toString() })
              .populate("post", "_id slug mainphoto title")
              .populate("post", "_id slug mainphoto title")
              .exec((error, likes) => {
                if (error) {
                  res.json({
                    error: error,
                  });
                  console.log(error);
                }

                /**
                 * Build an object that will contain not only all the info
                 * for this comment, but also all the info for the article
                 * that it is attached to.
                 */
                commentInfo = {
                  ...data._doc,
                  comments_for_post: postComments,
                  comments_length: postComments.length,
                  post_liked_by: likes,
                  likes_length: likes.length,
                };

                console.log("=================commentInfo===================");
                console.log(commentInfo);
                console.log("====================================");

                res.json(commentInfo);
              });
          });
      }
    });
};

// exports.createRecomended = (req, res) => {

//   const user_id = req.body.user_id;
//   const comment_id = req.body.comment_id;
//   const post_id = req.body.post_id;

//   Comment.findById(comment_id, (error, results) => {

//       if (error) {
//         res.json({
//           error: error,
//         });
//         console.log(error);
//       }

//      test = results.recommended.filter(elem => {
//         return elem.recommendedBy.toString() === user_id;
//       })

//      if (test.length > 0) {
//        return res
//          .status(400)
//          .json({ alreadyrecommened: "You already recommended this comment" });
//      }

//       const newRec = {
//         recommendedBy: user_id,
//       };

//       results.recommended.push(newRec)
//       // console.log(results)
//        results.save((error, response) => {

//         Comment.find({ post: post_id })
//           .populate("postedBy", "_id name username photo")
//           .populate("post", "_id slug mainphoto title")
//           .populate("replies.postedBy", "_id name username photo")
//           .populate("recommended.recommendedBy", "_id name username photo")
//           .exec((err, data) => {
//             if (err) {
//               return res.json({
//                 error: errorHandler(err),
//               });
//             }

//             res.json({
//               msg: "Successfully Recommended Comment",
//               recommended: data,
//             });
//           })

//        });

//   });
// }

exports.createRecomended = (req, res) => {
  const user_id = req.body.user_id;
  const comment_id = req.body.comment_id;
  const post_id = req.body.post_id;

  Comment.findById(comment_id)
    .populate("postedBy", "_id name username photo")
    .populate("post", "_id slug mainphoto title")
    .populate("replies.postedBy", "_id name username photo")
    .populate("recommended.recommendedBy", "_id name username photo")
    .exec((error, results) => {
      if (error) {
        res.json({
          error: error,
        });
        console.log(error);
      }

      test = results.recommended.filter((elem) => {
        return elem.recommendedBy._id.toString() === user_id;
      });

      if (test.length > 0) {
        console.log("====================================");
        console.log("already reced");
        console.log("====================================");

        return res
          .status(400)
          .json({ alreadyrecommened: "You already recommended this comment" });
      }

      const newRec = {
        recommendedBy: user_id,
      };

      results.recommended.push(newRec);
      // console.log(results)
      results.save((error, response) => {
        res.json({
          msg: "Successfully Recommended Comment",
          comment: response,
        });
      });
    });
};
