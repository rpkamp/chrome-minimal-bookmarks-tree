/* global module:false */
module.exports = function (grunt) {
    var browsers = [{
        browserName: "googlechrome",
        platform: "linux",
        version: "48.0"
    }, {
        browserName: "chrome",
        platform: "Windows 10",
        version: "beta"
    }, {
        browserName: "chrome",
        platform: "Windows 10",
        version: "50.0"
    }, {
        browserName: "chrome",
        platform: "Windows 10",
        version: "49.0"
    }, {
        browserName: "chrome",
        platform: "OS X 10.11",
        version: "beta"
    }, {
        browserName: "chrome",
        platform: "OS X 10.11",
        version: "50.0"
    }, {
        browserName: "chrome",
        platform: "OS X 10.11",
        version: "49.0"
    }];

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
                    key: function() {
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
        }
    });

    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
    }

    grunt.registerTask('test', ['connect', 'saucelabs-qunit']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', 'test');
};
