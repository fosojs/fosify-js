'use strict';

var insertVersion = require('./insert-version');
var stringConstant = require('./string-constant');
var _ = require('lodash');
var utcNow = require('utc-now');

exports.create = function(opts) {
  return {
    __host: _.constant(stringConstant(opts.host)),
    __secureHost: _.constant(stringConstant(opts.secureHost || opts.host)),
    __baseURL: _.constant(stringConstant(opts.baseURL || '')),
    __version: insertVersion,
    __generatedAt: _.constant('new Date(' + Number(utcNow()) + ')')
  };
};
