'use strict';

var path = require('path');
var fs = require('fs');
var findRoot = require('find-root');
var stringConstant = require('./string-constant');
var DEFAULT_VERSION = 'undefined';

function insertVersion(filePath, cwd) {
  var pkgPath = path.join(findRoot(filePath), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return stringConstant(DEFAULT_VERSION);
  }
  var bundlePkg = require(pkgPath);
  return stringConstant(bundlePkg.version || DEFAULT_VERSION);
}

module.exports = insertVersion;
