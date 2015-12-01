'use strict';

var expect = require('chai').expect;
var fjs = require('../');

describe('fosify-js', function() {
  it('exports a function', function() {
    expect(fjs).to.be.a('function');
  });
});
