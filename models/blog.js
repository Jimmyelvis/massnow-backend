const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        subtitle: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        body: {
            type: {},
            required: true,
            min: 200,
        },
        excerpt: {
            type: String,
            max: 200
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        mainphoto: {
            type: String
        },
        headerPhoto: {
            type: String
        },
        tags: {
            type: [String],
            required: true
        },
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        },
        featuredTopstory: {
            type: Number
        },
        featuredSports: {
            type: Number
        },
        featuredLocal: {
            type: Number
        },
        pageviews: {
            type: Number
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
