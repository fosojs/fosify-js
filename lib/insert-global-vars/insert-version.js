'use strict';

var path = require('path');
var fs = require('fs');
var findRoot = require('find-root');
var DEFAULT_VERSION = 'undefined';

function insertVersion(filePath, cwd) {
  var pkgPath = path.join(findRoot(filePath), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return JSON.stringify(DEFAULT_VERSION);
  }
  var bundlePkg = require(pkgPath);
  return JSON.stringify(bundlePkg.version || DEFAULT_VERSION);
}

module.exports = insertVersion;
