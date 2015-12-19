'use strict';

var Foso = require('foso');
var js = require('../');

var foso = new Foso();
foso
  .register(js, {
    src: './scripts',
    dest: './dist',
    host: 'example.com',
    secureHost: 'secure.example.com',
    baseURL: '/en-us',
    preset: 'develop'
  })
  .then(() => foso.bundle())
  .then(() => console.log('bundled'));
