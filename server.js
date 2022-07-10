const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const commentRoutes = require('./routes/comment');



// app
const app = express();

// db
mongoose
    .connect(process.env.DATABASE_CLOUD, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => console.log('DB connected to ' + process.env.DATABASE_CLOUD))
    .catch(err => {
        console.log(err);
    });

// middlewares
app.use(morgan('dev'));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: "50mb" }));
app.use(cookieParser());
// cors
if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
} else {
    app.use(cors({ origin: `${process.env.PRODUCTION_URL}` }));
}

/**
 * https://youtu.be/UaXzbv3W4jo?t=1344
 * Can't commit this to github has to change back to orig setup
 * Only for heroku
 */

// routes middleware
app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use("/api", commentRoutes);




// port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
