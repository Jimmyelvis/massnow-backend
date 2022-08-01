const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const { ObjectId } = mongoose.Schema;


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            unique: true,
            index: true,
            lowercase: true
        },
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        profile: {
            type: String,
            required: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        about: {
            type: String
        },
        role: {
            type: Number,
            default: 0
        },
        photo: {
            type: String
        },
        resetPasswordLink: {
            data: String,
            default: ''
        },
        favorite_articles: [
          
        ],
        profileBanner: {
            type: String
        }
    },
    { timestamp: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.hashed_password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("hashed_password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.hashed_password = await bcrypt.hash(this.hashed_password, salt);
});

module.exports = mongoose.model("User", userSchema);