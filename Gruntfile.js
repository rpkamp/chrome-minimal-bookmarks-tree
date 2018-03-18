/* global module:false */
module.exports = function (grunt) {
  var browsers = [{
    browserName: "chrome",
    platform: "OS X 10.12",
    version: "beta"
  }, {
    browserName: "chrome",
    platform: "OS X 10.12",
    version: "65.0"
  }, {
    browserName: "chrome",
    platform: "OS X 10.12",
    version: "51.0"
  }];

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  var webpack = require('webpack');

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> */'
    },
    clean: {
      pack: ['dist/', 'mbt.zip'],
      build: ['dist/']
    },
    compress: {
      main: {
        options: {
          archive: 'mbt.zip',
        },
        files: [
          {
            cwd: 'dist/',
            src: '**',
            expand: true,
          }
        ]
      }
    },
    connect: {
      server: {
        options: {
          base: '.',
          port: 9999
        },
      },
    },
    'saucelabs-qunit': {
      all: {
        options: {
          username: 'rpkamp',
          key: function () {
            return process.env.saucekey;
          },
          urls: ['http://127.0.0.1:9999/tests/index.html'],
          build: process.env.TRAVIS_JOB_ID,
          tunnelTimeout: 5,
          browsers: browsers,
          tesstname: "MBT QUnit tests"
        }
      },
    },
    eslint: {
      src: [
        'src/browser_action/*.js',
        'src/options/*.js',
        'src/background/*.js',
        'src/common/*.js',
      ],
    },
    webpack: {
      browserActionPage: {
        progress: true,
        entry: {
          popup: './src/browser_action/index.js',
        },
        output: {
          path: './dist/browser_action/',
          filename: 'index.js'
        },
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }]
        },
        resolve: {
          extensions: ['', '.js']
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        ]
      },
      optionsPage: {
        progress: true,
        entry: './src/options/index.js',
        output: {
          path: './dist/options',
          filename: 'index.js'
        },
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }]
        },
        resolve: {
          extensions: ['', '.js']
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        ]
      },
      backgroundPage: {
        progress: true,
        entry: './src/background/index.js',
        output: {
          path: './dist/background',
          filename: 'index.js'
        },
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }]
        },
        resolve: {
          extensions: ['', '.js']
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        ]
      },
      tests: {
        progress: true,
        entry: {
          settings_test: './tests/src/tests.js',
        },
        output: {
          path: './tests/',
          filename: 'tests.js'
        },
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }]
        },
        resolve: {
          extensions: ['', '.js']
        }
      }
    },
    copy: {
      main: {
        files: [
          { expand: true, cwd: 'src/', src: ['_locales/**'], dest: 'dist/' },
          { expand: true, cwd: 'src/', src: ['icons/**'], dest: 'dist/' },
          { expand: true, cwd: 'src/', src: ['manifest.json'], dest: 'dist/' },
          { expand: true, cwd: 'src/browser_action/', src: ['*.png'], dest: 'dist/browser_action/' },
          { src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/options/bootstrap4.css' },
          { src: 'node_modules/dragula/dist/dragula.css', dest: 'dist/browser_action/dragula.css' },
        ]
      }
    },
    htmlmin: {
      main: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true
        },
        files: [
          { expand: true, cwd: 'src/browser_action/', src: '*.html', dest: 'dist/browser_action/' },
          { expand: true, cwd: 'src/options/', src: '*.html', dest: 'dist/options/' },
          { expand: true, cwd: 'src/background/', src: '*.html', dest: 'dist/background/' }
        ]
      }
    },
    cssmin: {
      options: {},
      main: {
        files: [
          { expand: true, cwd: 'src/browser_action/', src: '*.css', dest: 'dist/browser_action/' },
          { expand: true, cwd: 'src/options/', src: '*.css', dest: 'dist/options/' },
          { expand: true, cwd: 'src/background/', src: '*.css', dest: 'dist/background/' }
        ]
      }
    }
  });

  grunt.registerTask('pack', ['test', 'clean:pack', 'build', 'compress']);
  grunt.registerTask('build', ['clean:build', 'webpack:browserActionPage', 'webpack:optionsPage', 'webpack:backgroundPage', 'copy', 'htmlmin', 'cssmin']);
  grunt.registerTask('build-tests', ['webpack:tests']);
  grunt.registerTask('test', ['lint', 'build-tests', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('default', 'build');
};
