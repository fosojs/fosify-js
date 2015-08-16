'use strict';

var foso = require('foso');
var js = require('../');

foso
  .please({
    src: './scripts',
    dest: './build',
    host: 'example.com',
    secureHost: 'secure.example.com',
    baseURL: '/en-us',
    watch: true,
    minify: false,
    esnext: true
  })
  .fosify(js)
  .now(function() {
    console.log('bundled');
  });
