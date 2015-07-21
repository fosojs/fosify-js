'use strict';

var expect = require('chai').expect;
var stringConstant = require('../../lib/insert-global-vars/string-constant');

describe('stringConstant', function() {
  it('returns string if string passed', function() {
    expect(stringConstant('foo')).to.eq('"foo"');
  });

  it('returns undefined if undefined passed', function() {
    expect(stringConstant()).to.eq('undefined');
  });

  it('returns null if not string and not undefined passed', function() {
    expect(stringConstant(12)).to.eq('null');
  });
});
