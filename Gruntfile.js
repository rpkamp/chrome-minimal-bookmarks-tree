/* global module:false */
module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> */'
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
            return process.env.SAUCE_LABS_ACCESS_KEY;
          },
          urls: ['http://127.0.0.1:9999/tests/index.html'],
          tunnelTimeout: 5,
          browsers: [
            {
              browserName: "chrome",
              platform: "OS X 10.12",
              version: "74.0"
            },
            {
              browserName: "chrome",
              platform: "OS X 10.12",
              version: "51.0"
            }
          ],
          testname: "MBT QUnit tests"
        }
      },
    }
  });

  grunt.registerTask('test', ['connect', 'saucelabs-qunit']);
  grunt.registerTask('default', 'test');
};
