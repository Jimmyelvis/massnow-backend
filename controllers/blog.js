const Blog = require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {

        console.log('fields:', fields);
        console.log('files:', files);

        let returnedTags;


        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

       

        const { title, subtitle, body, categories, tags, mainphoto } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }

        if (!subtitle || !subtitle.length) {
            return res.status(400).json({
                error: 'subtitle is required'
            });
        }

        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if (!tags || !tags.length) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }

        if (!mainphoto) {
            return res.status(400).json({
                error: 'A Main Photo is Required'
            })
        }

        // returnedTags = tags.split(",")

        console.log(req)

        let arrayOfTags = tags && tags.split(',');
        let blog = new Blog();
        blog.title = title; // from fields
        blog.subtitle = subtitle;
        blog.body = body;
        blog.mainphoto = mainphoto;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...');
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0, 160));
        blog.postedBy = req.user._id;
        blog.tags =  arrayOfTags;
        blog.featuredTopstory = 0;
        blog.featuredSports = 0;
        blog.featuredLocal = 0;

        // categories and tags
        let arrayOfCategories = categories && categories.split(',');

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        res.json(result);
                    }
                }
            );
        });


    });
};

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
    Blog.find({})
      .populate("categories", "_id name slug")
      // .populate('tags', '_id name slug')
      .populate("postedBy", "_id name username")
      .select(
        "_id title subtitle slug excerpt categories tags postedBy mdesc featuredTopstory featuredLocal featuredSports mainphoto createdAt updatedAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        res.json(data);
      });
};

exports.listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({})
      .populate("categories", "_id name slug")
      // .populate('tags', '_id name slug')
      .populate("postedBy", "_id name username profile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "_id title slug excerpt categories tags mainphoto postedBy createdAt featuredTopstory updatedAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        blogs = data; // blogs
        // get all categories
        Category.find({}).exec((err, c) => {
          if (err) {
            return res.json({
              error: errorHandler(err),
            });
          }
          categories = c; // categories
          // get all tags
          Tag.find({}).exec((err, t) => {
            if (err) {
              return res.json({
                error: errorHandler(err),
              });
            }
            tags = t;
            // return all blogs categories tags
            res.json({ blogs, categories, tags, size: blogs.length });
          });
        });
      });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name username photo')
        .select('_id title body slug subtitle mtitle mdesc mainphoto categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Blog deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug }).exec((err, oldBlog) => {
        if (err) {
            return res.status(400).json({
                error: "Can't find Slug"
            });
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image could not upload'
                });
            }

            /*
                The user maybe only updating one field eg. "title"
                in that case we don't need to update everything
                we just need to update what has changed.

                So we can use the _.merge function from the lodash library
                to merge only the fields that have changed.
            */
 
            let slugBeforeMerge = oldBlog.slug;

            /*
                If any fields have changed they will be updated otherwise
                they will be merged with no changes
            */
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;
            
            // console.log('===============oldblog=====================');
            // console.log(oldblog);
            // console.log('====================================');

            const { body, desc, categories, tags } = fields;

            if (body) {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.mdesc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldBlog.categories = categories.split(',');
            }

            if (tags) {
                oldBlog.tags = tags.split(',');
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }

            oldBlog.save((err, result) => {
                if (err) {
                    console.log('====================================');
                    console.log('Damn', err);
                    console.log('====================================');
                    return res.status(400).json({
                        error: "Can't Save"
                    });
                }
                // result.photo = undefined;
                res.json(result);
            });
        });
    });
};

exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', blog.photo.contentType);
            return res.send(blog.photo.data);
        });
};

exports.listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
        .populate('postedBy', '_id name username profile')
        .select('title slug excerpt postedBy createdAt mainphoto updatedAt')
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });
            }
            res.json(blogs);

        });
};


exports.listSearch = (req, res) => {
  console.log(req.query);

  /**
   *  { searcher } = req.query Whatever you name this
   *  will be equal to whatever you are searching for
   * ie. http://localhost:8000/api/blogs/search?searcher=Hockey
   */
  const { search } = req.query;

  if (search) {
    Blog.find(
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ],
      },
      (err, blogs) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(blogs);
      }
    )
      .populate("postedBy", "_id name username photo")
      .select("-photo -body");
  }
};

