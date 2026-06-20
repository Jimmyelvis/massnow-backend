"use strict";

var Settings = require("../models/settings");

var Category = require("../models/category");

var User = require("../models/user");

var Blog = require("../models/blog");

var _require = require("../helpers/dbErrorHandler"),
    errorHandler = _require.errorHandler;

var _require2 = require("mongoose"),
    ObjectId = _require2.ObjectId;

var blog = require("../models/blog");

exports.getSettings = function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          Settings.findOne({}).populate("featuredCategory", "_id name slug image description").populate("featuredColumnist", "_id name").populate("featuredCategory.articles", "_id title slug").exec(function _callee(err, settings) {
            var cat, columnist;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!err) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt("return", res.status(400).json({
                      error: errorHandler(err)
                    }));

                  case 2:
                    _context.next = 4;
                    return regeneratorRuntime.awrap(Category.findById(settings.featuredCategory.category).populate("articles", "_id title slug image description").exec());

                  case 4:
                    cat = _context.sent;
                    _context.next = 7;
                    return regeneratorRuntime.awrap(User.findById(settings.featuredColumnist).select("_id name username email profile photo about").exec());

                  case 7:
                    columnist = _context.sent;
                    // find the blogs from featuredCategory.articles
                    Blog.find({
                      _id: {
                        $in: settings.featuredCategory.articles
                      }
                    }).populate("categories", "_id name slug").populate("postedBy", "_id name photo").select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt").exec(function (err, blogs) {
                      if (err) {
                        return res.status(400).json({
                          error: errorHandler(err)
                        });
                      } // save in a new object to send to client


                      var settingsToSend = {
                        created: settings.createdAt,
                        id: settings._id,
                        featuredColumnist: columnist,
                        updated: settings.updatedAt,
                        featuredCategory: {
                          category: cat,
                          articles: blogs
                        }
                      };
                      res.json(settingsToSend);
                    });

                  case 9:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.addFeaturedCategory = function (req, res) {
  var categoryId = req.body.categoryId;
  Settings.findOneAndUpdate({}, {
    $set: {
      "featuredCategory.category": categoryId
    }
  }, {
    "new": true,
    upsert: true
  }, function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.addArticlesToFeaturedCategory = function (req, res) {
  var articleIds = req.body.articleIds;
  Settings.findOneAndUpdate({}, {
    $push: {
      "featuredCategory.articles": {
        $each: articleIds
      }
    }
  }, {
    "new": true,
    upsert: true
  }, function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.addFeaturedColumnist = function (req, res) {
  var columnistId = req.body.columnistId;
  Settings.findOneAndUpdate({}, {
    $set: {
      featuredColumnist: columnistId
    }
  }, {
    "new": true,
    upsert: true
  }, function (err, settings) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    settings.featuredColumnist = columnistId;
    settings.save(function (err, data) {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      res.json(data);
    });
  });
};