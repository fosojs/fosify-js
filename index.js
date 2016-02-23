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
var reactify = require('reactify');
var path = require('path');
var gulpif = require('gulp-if');
var redirectify = require('redirectify');
var header = require('gulp-header');
var futil = require('fosify');
var collapse = require('bundle-collapser/plugin');
var pkg = require('./package.json');
var insertGlobalVars = require('./lib/insert-global-vars');
var cwd = path.resolve(process.cwd());

var es6Extensions = ['.babel', '.es6'];
var standardExtensions = ['.jsx', '.js', '.json'];
var allExtensions = standardExtensions.concat(es6Extensions);

function getHeaderCode(opts) {
  opts = opts || {};
  var livereload = opts.livereload;
  var code = opts.header || '/*! Was bundled at ' + new Date() + ' */\n';

  if (!livereload) {
    return code;
  }

  var port = livereload.port || '2769';

  return code + '(function(d, s, id) {' +
    'var js, fjs = d.getElementsByTagName(s)[0];' +
    'if (d.getElementById(id)) return;' +
    'js = d.createElement(s); js.id = id;' +
    'js.src = "https://localhost:' + port + '/livereload.js";' +
    'fjs.parentNode.insertBefore(js, fjs);' +
    '})(document, \'script\', \'livereload\');';
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
    .pipe(header(getHeaderCode(opts)))
    .pipe(vfs.dest(opts.dest));
}

function readPkg(src) {
  try {
    return require(path.join(src, 'package.json'));
  } catch (e) {
    return null;
  }
}

/**
 * Bundles JavaScript resources.
 * @param {String} opts.src - The path to the resources to bundle.
 * @param {String[]} [opts.ignore] - An array of patterns to exclude from
 *   bundling.
 * @param {Boolean} [opts.watch=false] - Indicates whether the resources should
 *   be watched for changes.
 * @param {Boolean} [opts.minify=false] - Indicates whether the resources should
 *   be minified during bundling.
 * @param {Boolean} [opts.debug=!opts.minify] - When is true, add a source map
 *   inline to the end of the bundle.
 * @param {String} [opts.env] - The environment to which the scripts are
 *   bundled.
 * @param {String} [opts.esnext=false] - Indicates whether all scripts are
 *   written using the latest version of EcmaScript.
 * @param {String} [opts.dest=./dist] - The destination path for the bundled
 *   resources.
 * @param {(Object|Boolean)} [opts.livereload] - Indicates whether to set up a
 *   livereload server.
 * @param {String} opts.host - The host on which the resources are hosted. E.g.
 *   cdn.example.com or localhost:3000
 * @param {String} [opts.secureHost] - The secure host on which the resources
 *   are hosted. Only needs to be specified if the secure host is not the same
 *   as the non-secure one. E.g. secure.example.com.
 * @param {String} [opts.baseURL] - The base URL of the resources starting with
 *   a leading slash. Has to be specified if the resources are hosted in a
 *   subdirectory. E.g. /en-us
 */
function bundleScripts(opts, cb) {
  futil.notifyUpdate(pkg);

  opts = opts || {};

  var rootIndexRegex = new RegExp(opts.src + '/_bundle\.(js|es6|babel)');
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

  var localPkg = readPkg(cwd);

  var pattern = opts.src +
    '{/*/**/bundle,/**/*.bundle,/_bundle}.{js,jsx,es6,babel}';
  if (localPkg && localPkg.main) {
    pattern = '{' + localPkg.main + ',' + pattern + '}';
  }
  glob(pattern, { ignore: opts.ignore }, function(err, files) {
    files.forEach(function(file) {
      var bundleName = getBundleName(file);

      var browserifyOpts = _.extend(opts.watch ? watchify.args : {}, {
        entries: [file],
        extensions: allExtensions,
        paths: [path.join(__dirname, './node_modules')],
        fullPaths: false,
        insertGlobalVars: insertGlobalVars.create(opts),
        debug: _.isUndefined(opts.debug) ? !opts.minify : opts.debug
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
          extensions: opts.esnext ? allExtensions : es6Extensions
        }))
        .transform(stringify({
          extensions: ['.html', '.txt'],
          minify: true,
          minifier: {
            extensions: ['.html']
          }
        }))
        .transform(redirectify, redirOpts)
        .transform(reactify);

      if (opts.minify) {
        bundler.plugin(collapse);
      }

      function rebundle() {
        bundle(bundleName, bundler, {
          minify: opts.minify,
          dest: opts.dest,
          livereload: opts.livereload,
          header: opts.header,
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
