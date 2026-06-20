"use strict";

var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    max: 32
  },
  description: {
    type: String,
    trim: true,
    max: 2000
  },
  image: {
    type: String
  },
  slug: {
    type: String,
    unique: true // index: true

  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Category', categorySchema);