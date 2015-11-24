'use strict';

var Foso = require('foso');
var js = require('../');

var foso = new Foso();
foso
  .register(js, {
    src: './scripts',
    dest: './build',
    host: 'example.com',
    secureHost: 'secure.example.com',
    baseURL: '/en-us',
    watch: true,
    minify: false,
    esnext: true
  })
  .then(() => foso.bundle())
  .then(() => console.log('bundled'));
