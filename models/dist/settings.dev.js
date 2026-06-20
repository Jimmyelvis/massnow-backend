"use strict";

var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;
var settingsSchema = new mongoose.Schema({
  featuredCategory: {
    category: {
      type: ObjectId,
      ref: 'Category'
    },
    articles: [{
      type: ObjectId,
      ref: 'Blog'
    }]
  },
  featuredColumnist: {
    type: ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Settings', settingsSchema);