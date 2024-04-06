const Blog = require('../models/blog');
const Category = require('../models/category');
const User = require('../models/user')
const Tag = require('../models/tag');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');
const { ObjectId } = require('mongoose');
const category = require('../models/category');
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


exports.uploadImage = async (req, res) => {



  try {
    // console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image);
    // console.log(result);
    res.json(result.secure_url);
  } catch (err) {
    console.log(err);
  }


};

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

       

        const { title, subtitle, body, categories, tags, mainphoto, headerPhoto } = fields;

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
        blog.headerPhoto = headerPhoto;
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

/**
 * Get all categories that have articles
 */
exports.getBlogCategories = (req, res) => {

  let catArray = [];

  Blog.find({})
    .populate("categories", "_id name slug")
    // .populate('tags', '_id name slug')
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .select("_id title subtitle slug excerpt categories tags postedBy mdesc featuredTopstory featuredLocal featuredSports mainphoto createdAt updatedAt")
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

     data.forEach(article => {

      /**
       * Destucture the category array from each article
       */
      let  { categories } = article;

      // console.log("==============categories======================");
      // console.log(typeof(categories));
      // console.log('====================================');

      categories.forEach(category => {
        
        // push each category object onto catArray
        catArray.push(category)
      });
      
    });
    
      // Create new Set from catArray
      let unique = [...new Set(catArray)];

      res.json(unique);
    });
};

exports.list = (req, res) => {
    Blog.find({})
      .populate("categories", "_id name slug")
      // .populate('tags', '_id name slug')
      .populate("postedBy", "_id name username photo")
      .sort({ createdAt: -1 })
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

exports.listAll = (req, res) => {
  Blog.find({})
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.listTopNews = (req, res) => {
  Blog.find({ featuredTopstory: { $gt: 0 } })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ featuredTopstory: 1 })
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

exports.listNotTopNews = (req, res) => {
  Blog.find({ featuredTopstory: { $lt: 1 } })
    .populate("categories", "_id name slug")
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

exports.getSportsNews = (req, res) => {
  /** We have to search by category ID */

  Blog.find({ categories: "5f7ba80ff98efee1d0650deb" })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .select(
      "_id title subtitle slug excerpt categories tags postedBy mdesc featuredTopstory featuredLocal featuredSports mainphoto createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: err,
        });
      }
      res.json(data);
    });
};


exports.listFeaturedSportsNews = (req, res) => {
  Blog.find({ featuredSports: { $gt: 0 } })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ featuredSports: 1 })
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

exports.notListFeaturedSportsNews = (req, res) => {

   /** We have to search by category ID */ 

  Blog.find({  $and: [{ categories: "5f7ba80ff98efee1d0650deb" }, {featuredSports: { $lt: 1 }}] })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .select(
      "_id title subtitle slug excerpt categories tags postedBy mdesc featuredTopstory featuredLocal featuredSports mainphoto createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: err,
        });
      }
      res.json(data);
    });
};

exports.listFeaturedLocalNews = (req, res) => {
  Blog.find({ featuredLocal: { $gt: 0 } })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ featuredLocal: 1 })
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

exports.notListFeaturedLocalNews = (req, res) => {
  /** We have to search by category ID */

  Blog.find({
    $and: [
      { categories: "5f7ba819f98efee1d0650dec" },
      { featuredLocal: { $lt: 1 } },
    ],
  })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .select(
      "_id title subtitle slug excerpt categories tags postedBy mdesc featuredTopstory featuredLocal featuredSports mainphoto createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: err,
        });
      }
      res.json(data);
    });
};

exports.addToFavorites = (req, res) => {
  const user_id = req.body.user_id
  const post_id = req.body.post_id
  const post_title = req.body.post_title
  const mainPhoto = req.body.mainPhoto
  const postAuthor = req.body.postAuthor
  const slug = req.body.slug

  console.log("============req.body========================");
  console.log(req.body);
  console.log('====================================');

  User.findById(user_id, (error, results) => {

     if (error) {
        res.json({
          error: error,
        });
        console.log(error);
     }

    //  console.log('===============title=====================');
    //  console.log(req.body);
    //  console.log('====================================');

     const newFavoritePost = {
       post_title,
       mainPhoto,
       postAuthor,
       slug,
       user_id,
       post_id,
       time_added : Date.now()
     };

    //  res.json(newFavoritePost)

     results.favorite_articles.push(newFavoritePost);
     console.log(results)
     results.save((error, response) => {
       res.json({
         msg: 'Successfully Added Article'
       })
     })
  })

  // res.json({ mgs: "Cool", post_id: post_id, user_id: user_id });
};

exports.removeFromFavorites = (req, res) => {
  const user_id = req.body.user_id;
  const post_id = req.body.post_id;



  User.findById(user_id, (error, results) => {

    if (error) {
      res.json({
        error: error,
      });
      console.log(error);
    }



   let newResults = results.favorite_articles.filter((elem) => {
      return elem.post_id !== post_id
    })


    results.favorite_articles = newResults
    results.save((error, response) => {
      res.json({
        msg: "Removed From Favorites",
      });
    });

    // res.json(newResults);

  })
}

/**
 * @route api/blogs/edit-topnews/
 * @access Private
 * 
 * This the api route for editing the top news section on the front
 * end. We need to take in three parameters on the req.body:
 * -- prevPostId this is the id of the post that will be replaced
 * -- nextPostId this is the id of the post that we are inserting in
 *    the top news section
 * -- nextPostPosNumber this the position number that the newly inserted
 *    post will be placed in.
 * 
 * We first need to find the id of the post that we are taking out of the top
 * news section, using const prevPost, if we don't have any problems finding
 * then we set its (featuredTopstory) value to 0 which will take it out of that
 * section. We repeat the finding step but now with the id of the new post
 * that we're inserting into that section const nextPost.
 * 
 * We then set its (featuredTopstory) value to the req.body.nextPostPosNumber value
 * that we get from the req object. If everything is successful we will respond with
 * the new post.
 */
exports.editTopNewsSection = (req, res) => {

    const prevPost = req.body.prevPostId;
    const nextPost = req.body.nextPostId;
    const nextPostPosNumber= req.body.nextPostPosNumber;

    
    Blog.findById(prevPost, (error, prevPostresult) => {

      if (error) {
        res.json({
          error: error,
        });
        console.log(error);
      } 

      else if (nextPost === "" || undefined || null) {
          res.json({ msg: "nextPostId is missing" });
      } 
      
      else {
        prevPostresult.featuredTopstory = 0;
        console.log(prevPostresult);
        prevPostresult.save((error, updatedRecord) => {
          console.log("success");
        });

        Blog.findById(nextPost, (error, nextPostresult) => {
          if (error) {
            res.json({
              error: error,
            });
            console.log(error);
          } else {
            nextPostresult.featuredTopstory = nextPostPosNumber;
            console.log(nextPostresult);
            nextPostresult.save((error, updatedRecord) => {
              res.json({
                msg: `Successfully Replaced with ${updatedRecord.title}`,
              });
              console.log("success");
            });
          }
        });
      }
    });

     
}


exports.editTopSportsNewsSection = (req, res) => {
  const prevPost = req.body.prevPostId;
  const nextPost = req.body.nextPostId;
  const nextPostPosNumber = req.body.nextPostPosNumber;

  Blog.findById(prevPost, (error, prevPostresult) => {
    if (error) {
      res.json({
        error: error,
      });
      console.log(error);
    } else if (nextPost === "" || undefined || null) {
      res.json({ msg: "nextPostId is missing" });
    } else {
      prevPostresult.featuredSports = 0;
      console.log(prevPostresult);
      prevPostresult.save((error, updatedRecord) => {
        console.log("success");
      });

      Blog.findById(nextPost, (error, nextPostresult) => {
        if (error) {
          res.json({
            error: error,
          });
          console.log(error);
        } else {
          nextPostresult.featuredSports = nextPostPosNumber;
          console.log(nextPostresult);
          nextPostresult.save((error, updatedRecord) => {
            res.json({
              msg: `Successfully Replaced with ${updatedRecord.title}`,
            });
            console.log("success");
          });
        }
      });
    }
  });
};

exports.editTopLocalNewsSection = (req, res) => {
  const prevPost = req.body.prevPostId;
  const nextPost = req.body.nextPostId;
  const nextPostPosNumber = req.body.nextPostPosNumber;

  Blog.findById(prevPost, (error, prevPostresult) => {
    if (error) {
      res.json({
        error: error,
      });
      console.log(error);
    } else if (nextPost === "" || undefined || null) {
      res.json({ msg: "nextPostId is missing" });
    } else {
      prevPostresult.featuredLocal = 0;
      console.log(prevPostresult);
      prevPostresult.save((error, updatedRecord) => {
        console.log("success");
      });

      Blog.findById(nextPost, (error, nextPostresult) => {
        if (error) {
          res.json({
            error: error,
          });
          console.log(error);
        } else {
          nextPostresult.featuredLocal = nextPostPosNumber;
          console.log(nextPostresult);
          nextPostresult.save((error, updatedRecord) => {
            res.json({
              msg: `Successfully Replaced with ${updatedRecord.title}`,
            });
            console.log("success");
          });
        }
      });
    }
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


/**
 * 
 * Find A single Blog 
 * Using  the slug 
 * 
 */
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
      .populate("categories", "_id name slug")
      .populate("postedBy", "_id name username photo about email")
      .select(
        "_id title body slug subtitle mtitle mdesc mainphoto headerPhoto categories tags postedBy createdAt featuredTopstory featuredLocal featuredSports  updatedAt"
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

