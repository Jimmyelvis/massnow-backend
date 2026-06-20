"use strict";

var express = require('express');

var morgan = require('morgan');

var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');

var cors = require('cors');

var mongoose = require('mongoose');

require('dotenv').config(); // bring routes


var blogRoutes = require('./routes/blog');

var authRoutes = require('./routes/auth');

var userRoutes = require('./routes/user');

var categoryRoutes = require('./routes/category');

var tagRoutes = require('./routes/tag');

var commentRoutes = require('./routes/comment');

var settingsRoutes = require('./routes/settings'); // app


var app = express(); // db

mongoose.connect(process.env.DATABASE_CLOUD, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(function () {
  return console.log('DB connected to ' + process.env.DATABASE_CLOUD);
})["catch"](function (err) {
  console.log(err);
}); // middlewares

app.use(morgan('dev')); // app.use(bodyParser.json());

app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(cookieParser()); // cors

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: "".concat(process.env.CLIENT_URL)
  }));
} else {
  app.use(cors({
    origin: "".concat(process.env.PRODUCTION_URL)
  }));
} // routes middleware


app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use("/api", commentRoutes);
app.use("/api", settingsRoutes); // port

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Server is running on port ".concat(port));
});