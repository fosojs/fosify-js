'use strict';

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var vfs = require('vinyl-fs');
var uglify = require('gulp-uglify');
var R = require('ramda');
var glob = require('glob');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var path = require('path');
var gulpif = require('gulp-if');
var header = require('gulp-header');
var futil = require('fosify');
var collapse = require('bundle-collapser/plugin');
var pkg = require('./package.json');
var insertGlobalVars = require('./lib/insert-global-vars');
var requireDir = require('require-dir');
var presets = requireDir('./presets');

var es6Extensions = ['.babel', '.es6'];
var standardExtensions = ['.jsx', '.js', '.json'];
var allExtensions = standardExtensions.concat(es6Extensions);

function getHeaderCode(livereload) {
  var code = '/*! Was bundled at ' + new Date() + ' */\n';

  if (!livereload) {
    return code;
  }

  var port = livereload.port || '2769';
  var isSecure = !!livereload.key;
  var protocol = isSecure ? 'https:' : 'http:';

  return code + '(function(d, s, id) {' +
    'var js, fjs = d.getElementsByTagName(s)[0];' +
    'if (d.getElementById(id)) return;' +
    'js = d.createElement(s); js.id = id;' +
    'js.src = "' + protocol + '//localhost:' + port + '/livereload.js";' +
    'fjs.parentNode.insertBefore(js, fjs);' +
    '})(document, \'script\', \'foso-livereload\');';
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
    .on('error', err => {
      console.error(err);
      process.exit(1);
    })
    .pipe(header(getHeaderCode(opts.livereload)))
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
module.exports = function(plugin, opts, next) {
  futil.notifyUpdate(pkg);

  opts = opts || {};
  opts = R.merge(opts, presets[opts.preset] || {});

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

  var localPkg = readPkg(opts.basePath);

  var pattern = opts.src +
    '{/*/**/bundle,/**/*.bundle,/_bundle}.{js,jsx,es6,babel}';
  if (localPkg && localPkg.main) {
    let fullMainPath = path.resolve(opts.basePath, localPkg.main);
    pattern = '{' + fullMainPath + ',' + pattern + '}';
  }

  plugin.expose('bundle', function(cb) {
    cb = cb || function() {};
    glob(pattern, { ignore: opts.ignore }, function(err, files) {
      files.forEach(function(file) {
        var bundleName = getBundleName(file);

        var browserifyOpts = R.merge(opts.watch ? watchify.args : {}, {
          entries: [file],
          extensions: allExtensions,
          paths: [path.join(__dirname, './node_modules')],
          fullPaths: false,
          insertGlobalVars: insertGlobalVars.create(opts),
          debug: typeof opts.debug === 'undefined' ? !opts.minify : opts.debug,
          standalone: opts.standalone
        });

        var ify = R.compose(opts.watch ? watchify : R.identity, browserify);
        var bundler = ify(browserifyOpts).transform(babelify.configure());

        if (opts.minify) {
          bundler.plugin(collapse);
        }

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
  });

  plugin.root.extensions.push('js');

  next();
};

module.exports.attributes = {
  pkg: require('./package.json')
};
