"use strict";

var _require = require('express-validator'),
    check = _require.check;

exports.categoryCreateValidator = [check('name').not().isEmpty().withMessage({
  name: 'Name is required'
}), check('description').not().isEmpty().withMessage({
  description: 'Description is required'
}).isLength({
  max: 2000
}).withMessage({
  description: 'Description should be less than 2000 characters'
}), check('mainphoto').not().isEmpty().withMessage({
  mainphoto: 'Main photo URL is required'
})];