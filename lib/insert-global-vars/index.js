'use strict';

var insertVersion = require('./insert-version');
var stringConstant = require('./string-constant');
var R = require('ramda');
var utcNow = require('utc-now');

exports.create = function(opts) {
  return {
    __host: R.always(stringConstant(opts.host)),
    __secureHost: R.always(stringConstant(opts.secureHost || opts.host)),
    __baseURL: R.always(stringConstant(opts.baseURL || '')),
    __version: insertVersion,
    __generatedAt: R.always('new Date(' + Number(utcNow()) + ')')
  };
};
