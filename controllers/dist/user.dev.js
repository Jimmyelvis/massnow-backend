"use strict";

var User = require("../models/user");

var Blog = require("../models/blog");

var _ = require("lodash");

var formidable = require("formidable");

var fs = require("fs");

var _require = require("../helpers/dbErrorHandler"),
    errorHandler = _require.errorHandler;

var shortId = require("shortid");

var jwt = require("jsonwebtoken");

var expressJwt = require("express-jwt");

exports.read = function (req, res) {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = function (req, res) {
  var username = req.params.username;
  var user;
  var blogs;
  User.findOne({
    username: username
  }).exec(function (err, userFromDB) {
    if (err || !userFromDB) {
      return res.status(400).json({
        error: "User not found"
      });
    }

    user = userFromDB;
    var userId = user._id;
    Blog.find({
      postedBy: userId
    }).populate("categories", "_id name slug") // .populate("tags", "_id name slug")
    .populate("postedBy", "_id name photo").limit(10).select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt").exec(function (err, data) {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      user.hashed_password = undefined;
      res.json({
        user: user,
        blogs: data
      });
    });
  });
};

exports.update = function (req, res) {
  var form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, function (err, fields, files) {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      });
    }

    var user = req.profile;
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: "Password should be min 6 characters long"
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


    user.save(function (err, result) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
};

exports.allusers = function (req, res) {
  User.find({}).exec(function (err, data) {
    if (err) {
      return res.json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.getAuthors = function (req, res) {
  User.find({
    role: 1
  }).select("_id name email profile username photo about").exec(function (err, data) {
    if (err) {
      return res.json({
        error: errorHandler(err)
      });
    }

    var results = [];
    var theBlogs;
    res.json(data);
  });
};

exports.getBlogsByAuthor = function (req, res) {
  var userId = req.params.userId;
  var limit = req.query.limit ? parseInt(req.query.limit) : 10;
  Blog.find({
    postedBy: userId
  }).populate("categories", "_id name slug") // .populate("tags", "_id name slug")
  .populate("postedBy", "_id name photo").limit(limit).select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt").exec(function (err, data) {
    if (err) {
      console.log("RAW ERROR:", err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.oneUser = function (req, res) {
  var username = req.body.username;
  User.findOne({
    username: username
  }).exec(function (err, data) {
    if (err) {
      return res.json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.changeUser = function (req, res) {
  var username = req.body.username;
  var role = req.body.role;
  console.log("==============role======================");
  console.log(role);
  console.log("====================================");
  User.findOne({
    username: username
  }) // .select(
  //   "_id role name email profile username photo about"
  // )
  .exec(function (err, data) {
    if (err) {
      return res.json({
        error: errorHandler(err)
      });
    }

    data.role = role;
    data.save(function (error, results) {
      if (error) {
        return res.status(400).json({
          error: "Can't Save"
        });
      }

      res.json({
        msg: "User Role Successfully Changed"
      });
    });
  });
};

exports.createUser = function (req, res) {
  var _req$body = req.body,
      name = _req$body.name,
      email = _req$body.email,
      password = _req$body.password,
      role = _req$body.role,
      username = _req$body.username;
  User.findOne({
    email: email
  }).exec(function (err, userFromDB) {
    if (userFromDB) {
      return res.status(400).json({
        error: "Email is taken"
      });
    }

    User.findOne({
      username: username
    }).exec(function (err, userFromDB) {
      if (userFromDB) {
        return res.status(400).json({
          error: "Username already exists"
        });
      } // // check for required fields
      // if (!name || !email || !password || !role || !username) {
      //   return res.status(400).json({
      //     error: "All fields are required",
      //   });
      // }


      var profile = "".concat(process.env.CLIENT_URL, "/profile/").concat(username);
      var hashed_password = password;
      var newUser = new User({
        name: name,
        email: email,
        hashed_password: hashed_password,
        profile: profile,
        username: username,
        role: role
      });
      newUser.save(function (err, success) {
        if (err) {
          return res.status(400).json({
            error: err
          });
        }

        res.json({
          message: "User Created Successfully"
        });
      });
    });
  });
};