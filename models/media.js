const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    public_id: {
      type: String,
      unique: true,
    },
    postedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);
