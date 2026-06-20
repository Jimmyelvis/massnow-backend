"use strict";

var User = require('../models/user');

var shortId = require('shortid');

var jwt = require('jsonwebtoken');

var expressJwt = require('express-jwt');

exports.signup = function (req, res) {
  // console.log(req.body);
  User.findOne({
    email: req.body.email
  }).exec(function (err, user) {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken'
      });
    }

    User.findOne({
      username: req.body.username
    }).exec(function (err, user) {
      if (user) {
        return res.status(400).json({
          error: "Username already exists"
        });
      }

      var _req$body = req.body,
          name = _req$body.name,
          email = _req$body.email,
          password = _req$body.password,
          username = _req$body.username; // let username = shortId.generate();

      var profile = "".concat(process.env.CLIENT_URL, "/profile/").concat(username); // set the hashed_password to === req.body.password

      var hashed_password = password;
      var newUser = new User({
        name: name,
        email: email,
        hashed_password: hashed_password,
        profile: profile,
        username: username
      });
      newUser.save(function (err, success) {
        if (err) {
          return res.status(400).json({
            error: err
          });
        } // res.json({
        //     user: success
        // });


        res.json({
          message: 'Signup success! Please signin.'
        });
      });
    });
  });
}; // exports.signin = (req, res) => {
//     const { email, password } = req.body;
//     // check if user exist
//     User.findOne({ email }).exec((err, user) => {
//         if (err || !user) {
//             return res.status(400).json({
//                 error: 'User with that email does not exist. Please signup.'
//             });
//         }
//         // authenticate
//         if (!user.authenticate(password)) {
//             return res.status(400).json({
//                 error: 'Email and password do not match.'
//             });
//         }
//         // generate a token and send to client
//         const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//         res.cookie('token', token, { expiresIn: '7d' });
//         const { _id, username, name, email, role, photo } = user;
//         return res.json({
//             token,
//             user: { _id, username, name, email, role, photo }
//         });
//     });
// };


exports.signin = function (req, res) {
  var _req$body2 = req.body,
      email = _req$body2.email,
      password = _req$body2.password; // check if user exist

  User.findOne({
    email: email
  }).exec(function (err, user) {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup."
      });
    } // authenticate


    if (!user.matchPassword(password)) {
      return res.status(400).json({
        error: "Email and password do not match."
      });
    } // generate a token and send to client


    var token = jwt.sign({
      _id: user._id
    }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    res.cookie("token", token, {
      expiresIn: "7d"
    });
    var _id = user._id,
        username = user.username,
        name = user.name,
        email = user.email,
        role = user.role,
        photo = user.photo;
    return res.json({
      token: token,
      user: {
        _id: _id,
        username: username,
        name: name,
        email: email,
        role: role,
        photo: photo
      }
    });
  });
};

exports.signout = function (req, res) {
  res.clearCookie('token');
  res.json({
    message: 'Signout success'
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET
});

exports.authMiddleware = function (req, res, next) {
  var authUserId = req.user._id;
  User.findById({
    _id: authUserId
  }).exec(function (err, user) {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    req.profile = user;
    next();
  });
};

exports.adminMiddleware = function (req, res, next) {
  var adminUserId = req.user._id;
  User.findById({
    _id: adminUserId
  }).exec(function (err, user) {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (user.role < 2) {
      return res.status(400).json({
        error: 'Admin resource. Access denied'
      });
    }

    req.profile = user;
    next();
  });
};