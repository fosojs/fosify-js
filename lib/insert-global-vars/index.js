'use strict';

var insertVersion = require('./insert-version');
var stringConstant = require('./string-constant');
var _ = require('lodash');

exports.create = function(opts) {
  return {
    __host: _.constant(stringConstant(opts.host)),
    __secureHost: _.constant(stringConstant(opts.secureHost || opts.host)),
    __baseURL: _.constant(stringConstant(opts.baseURL || '')),
    __version: insertVersion
  };
};
