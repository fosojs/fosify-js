'use strict';

function stringConstant(text) {
  if (typeof text === 'string') {
    return '"' + text + '"';
  }
  if (typeof text === 'undefined') {
    return 'undefined';
  }
  return 'null';
}

module.exports = stringConstant;
