const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;


const settingsSchema = new mongoose.Schema(
    {
        featuredCategory: {
            category: { type: ObjectId, ref: 'Category' },
            articles: [{ type: ObjectId, ref: 'Blog' }]
        },
        featuredColumnist: {
            type: ObjectId,
            ref: 'User',
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
