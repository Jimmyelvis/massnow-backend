"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var Category = require('../models/category');

var Blog = require('../models/blog');

var slugify = require('slugify');

var _require = require('../helpers/dbErrorHandler'),
    errorHandler = _require.errorHandler;

exports.create = function (req, res) {
  var name = req.body.name;
  var image = req.body.mainphoto || '';
  var description = req.body.description || '';
  var slug = slugify(name).toLowerCase();
  var category = new Category({
    name: name,
    slug: slug,
    image: image,
    description: description
  });
  category.save(function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
};

exports.update = function (req, res) {
  // const { name, description, image, slug } = req.body;
  var _id = req.params.id;
  var updates = {};

  if (req.body.name) {
    updates.name = req.body.name;
  }

  if (req.body.description) {
    updates.description = req.body.description;
  }

  if (req.body.mainphoto) {
    updates.image = req.body.mainphoto;
  }

  if (req.body.slug) {
    updates.slug = req.body.slug;
  }

  Category.findOneAndUpdate({
    _id: _id
  }, {
    $set: updates
  }, {
    "new": true
  }).exec(function (err, updated) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    console.log('Updated category:', updated);
    res.json(updated);
  });
};

exports.list = function (req, res) {
  Category.find({}).exec(function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(data);
  });
}; // sort categories by number of blogs in each category


exports.listWithBlogsCount = function (req, res) {
  Category.aggregate([{
    $lookup: {
      from: 'blogs',
      localField: '_id',
      foreignField: 'categories',
      as: 'blogs'
    }
  }, {
    $addFields: {
      blogsCount: {
        $size: '$blogs'
      }
    }
  }, {
    $project: {
      name: 1,
      slug: 1,
      image: 1,
      description: 1,
      blogsCount: 1,
      createdAt: 1,
      updatedAt: 1
    }
  }]).exec(function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    } // sort by using Date object to sort by createdAt field in descending order


    var sortedData = data.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json(sortedData);
  });
};

exports.read = function (req, res) {
  var slug = req.params.slug.toLowerCase();
  var limit = parseInt(req.query.limit) || 3;
  Category.findOne({
    slug: slug
  }).exec(function (err, category) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    } // res.json(category);


    Blog.find({
      categories: category
    }).populate("categories", "_id name slug") // .populate('tags', '_id name slug')
    .populate("postedBy", "_id name").sort({
      updatedAt: -1
    }).limit(limit).select("_id title slug excerpt featuredTopstory featuredSports featuredLocal featuredWeather mainphoto subtitle categories postedBy tags createdAt updatedAt").exec(function (err, data) {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      res.json({
        category: category,
        blogs: data
      });
    });
  });
}; // modern optimized version 


exports.read_v2 = function _callee(req, res) {
  var slug, limit, category, _ref, _ref2, blogs, blogsCount;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          slug = req.params.slug.toLowerCase();
          limit = parseInt(req.query.limit, 10) || 3;
          _context.next = 5;
          return regeneratorRuntime.awrap(Category.findOne({
            slug: slug
          }));

        case 5:
          category = _context.sent;

          if (category) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            error: 'Category not found'
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(Promise.all([Blog.find({
            categories: category._id
          }).populate('categories', '_id name slug').populate('postedBy', '_id name').sort({
            updatedAt: -1
          }).limit(limit).select('_id title slug excerpt featuredTopstory featuredSports featuredLocal featuredWeather mainphoto subtitle categories postedBy tags createdAt updatedAt'), Blog.countDocuments({
            categories: category._id
          })]));

        case 10:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 2);
          blogs = _ref2[0];
          blogsCount = _ref2[1];
          res.json({
            category: category,
            blogs: blogs,
            blogsCount: blogsCount,
            blogsReturned: blogs.length
          });
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          res.status(400).json({
            error: errorHandler(_context.t0)
          });

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
};

exports.remove = function (req, res) {
  var slug = req.params.slug.toLowerCase();
  Category.findOneAndRemove({
    slug: slug
  }).exec(function (err, data) {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json({
      message: 'Category deleted successfully'
    });
  });
};