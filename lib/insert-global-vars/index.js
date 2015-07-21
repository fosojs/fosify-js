'use strict';

var insertVersion = require('./insert-version');
var stringConstant = require('./string-constant');

exports.create = function(opts) {
  return {
    __host: stringConstant(opts.host),
    __secureHost: stringConstant(opts.secureHost || opts.host),
    __baseURL: stringConstant(opts.baseURL || ''),
    __version: insertVersion
  };
};
