'use strict';

var expect = require('chai').expect;
var fjs = require('../');

describe('fosify-js', function() {
  it('exports a function', function() {
    expect(fjs).to.be.a('function');
  });

  it('returns the correct set of extensions', function() {
    expect(fjs.extensions).to.be.instanceof(Array);
    expect(fjs.extensions.length).to.equal(1);
    expect(fjs.extensions[0]).to.equal('js');
  });
});
