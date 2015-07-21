'use strict';

var _ = require('lodash');

function stringConstant(text) {
  if (typeof text === 'string') {
    return '"' + text + '"';
  }
  if (_.isUndefined(text)) {
    return 'undefined';
  }
  return 'null';
}

module.exports = stringConstant;
