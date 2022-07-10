const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    body: {
      type: String,
      required: true,
      min: 5,
    },
    recommended: [
      {
        recommendedBy: {
          type: ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    flagged: {
      type: Boolean,
    },
    post: {
      type: ObjectId,
      ref: "Blog",
      required: true,
    },
    replies: [
      {
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
        body: {
          type: String,
          required: true,
          min: 5,
        },
        recommended: [
          {
            replyrecommendedBy: {
              type: ObjectId,
              ref: "User",
            },
            date: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        flagged: {
          type: Boolean,
        },
        post: {
          type: ObjectId,
          ref: "Blog",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema)