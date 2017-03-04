/* global module:false */
module.exports = function (grunt) {
  var browsers = [{
    browserName: "googlechrome",
    platform: "linux",
    version: "48.0"
  }, {
    browserName: "googlechrome",
    platform: "linux",
    version: "47.0"
  }, {
    browserName: "chrome",
    platform: "Windows 10",
    version: "beta"
  }, {
    browserName: "chrome",
    platform: "Windows 10",
    version: "55.0"
  }, {
    browserName: "chrome",
    platform: "Windows 10",
    version: "54.0"
  }, {
    browserName: "chrome",
    platform: "Windows 10",
    version: "53.0"
  }, {
    browserName: "chrome",
    platform: "OS X 10.11",
    version: "beta"
  }, {
    browserName: "chrome",
    platform: "OS X 10.11",
    version: "55.0"
  }, {
    browserName: "chrome",
    platform: "OS X 10.11",
    version: "54.0"
  }, {
    browserName: "chrome",
    platform: "OS X 10.11",
    version: "53.0"
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

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> */'
    },
    clean: {
      pack: ['dist', 'mbt.zip'],
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
      src: ['src/js/**/*.js']
    },
    webpack: {
      build: {
        progress: true,
        entry: {
          background: './src/js/background.js',
          options: './src/js/options.js',
          popup: './src/js/popup.js',
        },
        output: {
          path: './dist/js',
          filename: '[name].js'
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
      },
      buildTests: {
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
          { expand: true, cwd: 'src/', src: ['js/vendor/**'], dest: 'dist/' },
          { expand: true, cwd: 'src/', src: ['manifest.json'], dest: 'dist/' },
          { src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dest: 'dist/css/bootstrap4.css' },
          { src: 'node_modules/dragula/dist/dragula.css', dest: 'dist/css/dragula.css' },
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
          { expand: true, cwd: 'src/', src: '*.html', dest: 'dist/' }
        ]
      }
    },
    cssmin: {
      options: {},
      main: {
        files: [
          { expand: true, cwd: 'src/', src: 'css/*.css', dest: 'dist/' }
        ]
      }
    }
  });

  grunt.registerTask('pack', ['test', 'clean:pack', 'build', 'compress']);
  grunt.registerTask('build', ['webpack', 'copy', 'htmlmin', 'cssmin']);
  grunt.registerTask('build-tests', ['webpack:buildTests']);
  grunt.registerTask('test', ['lint', 'build-tests', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('default', 'build');
};
