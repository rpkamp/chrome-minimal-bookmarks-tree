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
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: [
                    { expand: true, src: 'js/components/*.js', dest: 'dist/', cwd: 'src/' },
                    { expand: true, src: 'js/popup/*.js', dest: 'dist/', cwd: 'src/' },
                    { expand: true, src: 'js/*.js', dest: 'dist/', cwd: 'src/' },
                ]
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'src/', src: ['_locales/**'], dest: 'dist/' },
                    { expand: true, cwd: 'src/', src: ['icons/**'], dest: 'dist/' },
                    { expand: true, cwd: 'src/', src: ['js/vendor/**'], dest: 'dist/' },
                    { expand: true, cwd: 'src/', src: ['manifest.json'], dest: 'dist/' },
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

    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
    }

    grunt.registerTask('build', ['babel', 'copy', 'htmlmin']);
    grunt.registerTask('test', ['connect', 'saucelabs-qunit']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', 'build');
};
