/* global module:false */
module.exports = function (grunt) {
  const browsers = [{
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

  const webpack = require('webpack');
  const path = require('path');

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
          build: process.env.GITHUB_SHA,
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
      browserAction: {
        progress: true,
        entry: './src/browser_action/index.js',
        output: {
          path: path.resolve(__dirname, 'dist/browser_action/'),
          filename: 'index.js'
        },
        module: {
          rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
          }]
        },
        optimization: {
          minimize: true
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          })
        ]
      },
      optionsPage: {
        progress: true,
        entry: './src/options/index.js',
        output: {
          path: path.resolve(__dirname, 'dist/options/'),
          filename: 'index.js'
        },
        module: {
          rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
          }]
        },
        optimization: {
          minimize: true
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          }),
        ]
      },
      background: {
        progress: true,
        entry: './src/background/index.js',
        output: {
          path: path.resolve(__dirname, 'dist/background/'),
          filename: 'index.js'
        },
        module: {
          rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
          }]
        },
        optimization: {
          minimize: true
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: false,
            PRODUCTION: true
          }),
        ]
      },
      tests: {
        progress: true,
        entry: './tests/src/tests.js',
        output: {
          path: path.resolve(__dirname, 'tests'),
          filename: 'tests.js'
        },
        module: {
          rules: [{
            test: /\.js$/,
            loader: 'babel-loader'
          }]
        },
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
  grunt.registerTask('build', ['clean:build', 'webpack:browserAction', 'webpack:optionsPage', 'webpack:background', 'copy', 'htmlmin', 'cssmin']);
  grunt.registerTask('build-tests', ['webpack:tests']);
  grunt.registerTask('test', ['lint', 'build-tests', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('default', 'build');
};
