'use strict';

var insertVersion = require('./insert-version');
var _ = require('lodash');
var utcNow = require('utc-now');

exports.create = function(opts) {
  return Object.assign({}, opts.globalVars || {}, {
    __host: _.constant(JSON.stringify(opts.host)),
    __secureHost: _.constant(JSON.stringify(opts.secureHost || opts.host)),
    __baseURL: _.constant(JSON.stringify(opts.baseURL || '')),
    __version: insertVersion,
    __generatedAt: _.constant('new Date(' + Number(utcNow()) + ')')
  });
};
