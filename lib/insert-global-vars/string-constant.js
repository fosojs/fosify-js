'use strict';

var _ = require('lodash');

function stringConstant(text) {
  var result;
  if (typeof text === 'string') {
    result = '"' + text + '"';
  } else if (_.isUndefined(text)) {
    result = 'undefined';
  } else {
    result = 'null';
  }
  return _.constant(result);
}

module.exports = stringConstant;
