'use strict';

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var vfs = require('vinyl-fs');
var uglify = require('gulp-uglify');
var _ = require('lodash');
var glob = require('glob');
var watchify = require('watchify');
var browserify = require('browserify');
var lessify = require('node-lessify');
var stringify = require('stringify');
var jadeify = require('jadeify');
var babelify = require('babelify');
var path = require('path');
var gulpif = require('gulp-if');
var redirectify = require('redirectify');
var header = require('gulp-header');
var futil = require('fosify-util');

var es6Extensions = ['.babel', '.es6'];

function insertLivereload(livereload) {
  var code = '(function(d, s, id) {' +
    'var js, fjs = d.getElementsByTagName(s)[0];' +
    'if (d.getElementById(id)) return;' +
    'js = d.createElement(s); js.id = id;' +
    'js.src = "https://localhost:${port}/livereload.js";' +
    'fjs.parentNode.insertBefore(js, fjs);' +
    '})(document, \'script\', \'livereload\');';
  return header(code, {
    port: '2769'
  });
}

function bundle(bundleName, bundler, opts) {
  opts = opts || {};

  if (!opts.dest) {
    throw new Error('opts.dest is required');
  }

  return bundler
    .bundle()
    .on('error', function(err) {
      console.log('Error during bundling');
      console.error(err);
    })
    .pipe(source(bundleName))
    .pipe(buffer())
    .pipe(gulpif(opts.minify, uglify()))
    .pipe(gulpif(opts.livereload, insertLivereload(opts.livereload)))
    .pipe(vfs.dest(opts.dest));
}

function bundleScripts(opts, cb) {
  opts = opts || {};

  var rootIndexRegex = new RegExp(opts.src + '/fosofile\.(js|es6|babel)');
  var createPath = futil.bundleNamer({
    src: opts.src,
    extension: 'js'
  });
  function getBundleName(filePath) {
    if (rootIndexRegex.test(filePath)) {
      return 'index.js';
    }
    return createPath(filePath);
  }

  var pattern = opts.src +
    '{/*/**/bundle,/**/*.bundle,/fosofile}.{js,es6,babel}';
  glob(pattern, { ignore: opts.ignore }, function(err, files) {
    files.forEach(function(file) {
      var bundleName = getBundleName(file);

      var browserifyOpts = _.extend(opts.watch ? watchify.args : {}, {
        entries: [file],
        extensions: ['.js', '.json'].concat(es6Extensions),
        paths: [path.join(__dirname, '../node_modules')],
        insertGlobalVars: {
          __host: _.constant('"' + opts.host + '"'),
          __secureHost: _.constant('"' + (opts.secureHost || opts.host) + '"')
        }
      });

      var redirOpts = {};
      if (opts.env) {
        redirOpts.suffix = '.' + opts.env;
      }

      var ify = _.flow(browserify, opts.watch ? watchify : _.identity);
      var bundler = ify(browserifyOpts)
        .transform(lessify)
        .transform(jadeify, { pretty: false })
        .transform(babelify.configure({
          extensions: es6Extensions
        }))
        .transform(stringify({
          extensions: ['.html', '.txt'],
          minify: true,
          minifier: {
            extensions: ['.html']
          }
        }))
        .transform(redirectify, redirOpts);

      function rebundle() {
        bundle(bundleName, bundler, {
          minify: opts.minify,
          dest: opts.dest,
          livereload: opts.livereload
        });
        futil.log.bundled(bundleName);
      }

      bundler.on('update', rebundle);

      rebundle();
    });
    cb();
  });
}

module.exports = bundleScripts;
module.exports.extensions = ['js'];
