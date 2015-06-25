'use strict';

var foso = require('foso');
var js = require('../');

foso
  .please({
    src: './scripts',
    dest: './build',
    host: 'example.com',
    secureHost: 'secure.example.com',
    watch: true,
    minify: true
  })
  .fosify(js)
  .now(function() {
    console.log('bundled');
  });
