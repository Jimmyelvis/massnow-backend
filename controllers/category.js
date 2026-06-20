const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
    const { name } = req.body;
    const image = req.body.mainphoto || '';
    const description = req.body.description || '';
    let slug = slugify(name).toLowerCase();

    let category = new Category({ name, slug, image, description });

    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.update = (req, res) => {
    // const { name, description, image, slug } = req.body;
    const _id = req.params.id;

    const updates = {}

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

    Category.findOneAndUpdate(
        { _id },
        { $set: updates },
        { new: true })
        .exec((err, updated) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        console.log('Updated category:', updated);

        res.json(updated);
    });
}

exports.list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};


// sort categories by number of blogs in each category
exports.listWithBlogsCount = (req, res) => {
    Category.aggregate([
        {
            $lookup: {
                from: 'blogs',
                localField: '_id',
                foreignField: 'categories',
                as: 'blogs'
            }
        },
        {
            $addFields: {
                blogsCount: { $size: '$blogs' }
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                image: 1,
                description: 1,
                blogsCount: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        // sort by using Date object to sort by createdAt field in descending order
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(sortedData);
    });
}

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    const limit = parseInt(req.query.limit) || 3;
    

    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(category);
        Blog.find({ categories: category })
          .populate("categories", "_id name slug")
          // .populate('tags', '_id name slug')
          .populate("postedBy", "_id name")
          .sort({ updatedAt: -1 })
          .limit(limit)
          .select(
                        "_id title slug excerpt featuredTopstory featuredSports featuredLocal featuredWeather mainphoto subtitle categories postedBy tags createdAt updatedAt"
          )
          .exec((err, data) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.json({ category: category, blogs: data });
          });

    });
};


// modern optimized version 
exports.read_v2 = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const limit = parseInt(req.query.limit, 10) || 0;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    const [blogs, blogsCount] = await Promise.all([
      Blog.find({ categories: category._id })
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select(
          '_id title slug excerpt featuredTopstory featuredSports featuredLocal featuredWeather mainphoto subtitle categories postedBy tags createdAt updatedAt'
        ),
      Blog.countDocuments({ categories: category._id })
    ]);

    res.json({
      category,
      blogs,
      blogsCount,
      blogsReturned: blogs.length
    });
  } catch (err) {
    res.status(400).json({
      error: errorHandler(err)
    });
  }
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Category.findOneAndRemove({ slug }).exec((err, data) => {
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
