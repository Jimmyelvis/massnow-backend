const mongoose = require ("mongoose");
const dotenv = require ("dotenv");
const colors = require ("colors");
const users = require ("../data/users.js");
const blogs = require("../data/blogs.js");
const comments = require("../data/comments.js");
const categories = require("../data/categories")

const User = require ("../models/user.js");
const Blog = require ("../models/blog.js");
const Comment = require ("../models/comments.js");
const Category = require ("../models/category")

const connectDB = require ("../config/db.js");

dotenv.config();

connectDB();



const importData = async () => {
  try {
    await User.deleteMany();
    await Blog.deleteMany();
    await Comment.deleteMany();
    await Category.deleteMany();


    await User.insertMany(users);
    await Blog.insertMany(blogs);
    await Comment.insertMany(comments);
    await Category.insertMany(categories);



    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};


if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}