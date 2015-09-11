'use strict';

var expect = require('chai').expect;
var insertGlobalVars = require('../../lib/insert-global-vars');

describe('insertGlobalVars', function() {
  it('inserts all the required vars', function() {
    var packageVersion = require('../../package.json').version;
    var globalVars = insertGlobalVars.create({
      host: 'example.com',
      secureHost: 'secure.example.com',
      baseURL: '/base/url'
    });

    expect(globalVars.__host()).to.eq('"example.com"');
    expect(globalVars.__secureHost()).to.eq('"secure.example.com"');
    expect(globalVars.__baseURL()).to.eq('"/base/url"');
    expect(globalVars.__version()).to.eq('"' + packageVersion + '"');
    expect(globalVars.__generatedAt()).to.match(/^new Date\([0-9]{13}\)$/);
  });
});
