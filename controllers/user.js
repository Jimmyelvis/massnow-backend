const User = require("../models/user");
const Blog = require("../models/blog");
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;

  User.findOne({ username }).exec((err, userFromDB) => {
    if (err || !userFromDB) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    user = userFromDB;
    let userId = user._id;
    Blog.find({ postedBy: userId })
      .populate("categories", "_id name slug")
      // .populate("tags", "_id name slug")
      .populate("postedBy", "_id name photo")
      .limit(10)
      .select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        user.hashed_password = undefined;
        res.json({
          user,
          blogs: data,
        });
      });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }

    let user = req.profile;
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: "Password should be min 6 characters long",
      });
    }

    /**
     * If the files contain a photo
     */
    // if (files.photo) {
    //   if (files.photo.size > 60000000) {
    //     return res.status(400).json({
    //       error: "Image should be less than 6mb",
    //     });
    //   }

    //   user.photo.data = fs.readFileSync(files.photo.path);
    //   user.photo.contentType = files.photo.type;
    // }

    user.save((err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
};

exports.allusers = (req, res) => {
  User.find({}).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

exports.getAuthors = (req, res) => {
  User.find({ role: 1 })
    .select("_id name email profile username photo about")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      let results = [];

      let theBlogs;

      res.json(data);
    });
};

exports.getBlogsByAuthor = (req, res) => {
  let userId = req.params.userId;

  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  

  Blog.find({ postedBy: userId })
    .populate("categories", "_id name slug")
    // .populate("tags", "_id name slug")
    .populate("postedBy", "_id name photo")
    .limit(limit)
    .select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt")
    .exec((err, data) => {
      if (err) {
        console.log("RAW ERROR:", err);
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.oneUser = (req, res) => {
  const username = req.body.username;

  User.findOne({ username: username }).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

exports.changeUser = (req, res) => {
  const username = req.body.username;
  const role = req.body.role;

  console.log("==============role======================");
  console.log(role);
  console.log("====================================");

  User.findOne({ username: username })
    // .select(
    //   "_id role name email profile username photo about"
    // )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      data.role = role;

      data.save((error, results) => {
        if (error) {
          return res.status(400).json({
            error: "Can't Save",
          });
        }
        res.json({ msg: "User Role Successfully Changed" });
      });
    });
};

exports.createUser = (req, res) => {
  const { name, email, password, role, username } = req.body;

  User.findOne({ email: email }).exec((err, userFromDB) => {
    if (userFromDB) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    User.findOne({ username: username }).exec((err, userFromDB) => {
      if (userFromDB) {
        return res.status(400).json({
          error: "Username already exists",
        });
      }

      // // check for required fields
      // if (!name || !email || !password || !role || !username) {
      //   return res.status(400).json({
      //     error: "All fields are required",
      //   });
      // }

      let profile = `${process.env.CLIENT_URL}/profile/${username}`;

      let hashed_password = password;

      let newUser = new User({ name, email, hashed_password, profile, username, role });
      newUser.save((err, success) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }
        res.json({
          message: "User Created Successfully",
        });
      });
    });
  });
};
