const Settings = require("../models/settings");
const Category = require("../models/category");
const User = require("../models/user");
const Blog = require("../models/blog");
const {
  errorHandler
} = require("../helpers/dbErrorHandler");
const {
  ObjectId
} = require("mongoose");
const blog = require("../models/blog");

exports.getSettings = async (req, res) => {
  Settings.findOne({})
    .populate("featuredCategory", "_id name slug image description")
    .populate("featuredColumnist", "_id name")
    .populate("featuredCategory.articles", "_id title slug")
    .exec(async (err, settings) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      const cat = await Category.findById(settings.featuredCategory.category).populate("articles", "_id title slug image description").exec();

      const columnist = await User.findById(settings.featuredColumnist).select("_id name username email profile photo about").exec();

      // find the blogs from featuredCategory.articles
      Blog.find({
          _id: {
            $in: settings.featuredCategory.articles
          }
        })
        .populate("categories", "_id name slug")
        .populate("postedBy", "_id name photo")
        .select("_id title slug excerpt categories subtitle tags postedBy mainphoto createdAt updatedAt")
        .exec((err, blogs) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err),
            });
          }

          // save in a new object to send to client
          const settingsToSend = {
            created: settings.createdAt,
            id: settings._id,
            featuredColumnist: columnist,
            updated: settings.updatedAt,
            featuredCategory: {
              category: cat,
              articles: blogs,
            },
          };

          res.json(settingsToSend);
        });
    });
};

exports.addFeaturedCategory = (req, res) => {
  const {
    categoryId
  } = req.body;
  Settings.findOneAndUpdate({}, {
    $set: {
      "featuredCategory.category": categoryId
    }
  }, {
    new: true,
    upsert: true
  }, (err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json(data);
  });
};

exports.addArticlesToFeaturedCategory = (req, res) => {
  const {
    articleIds
  } = req.body;
  Settings.findOneAndUpdate({}, {
    $push: {
      "featuredCategory.articles": {
        $each: articleIds
      }
    }
  }, {
    new: true,
    upsert: true
  }, (err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json(data);
  });
};

exports.addFeaturedColumnist = (req, res) => {
  const {
    columnistId
  } = req.body;
  Settings.findOneAndUpdate({}, {
    $set: {
      featuredColumnist: columnistId
    }
  }, {
    new: true,
    upsert: true
  }, (err, settings) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    settings.featuredColumnist = columnistId;
    settings.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
  });
};