'use strict';

var fosify = require('fosify');
var js = require('../');

fosify({
  src: './scripts',
  dest: './build',
  host: 'example.com',
  secureHost: 'secure.example.com',
  watch: true,
  minify: true
})
.plugin(js)
.bundle(function() {
  console.log('bundled');
});
