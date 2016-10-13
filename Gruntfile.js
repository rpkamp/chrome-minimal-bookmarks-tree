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

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-saucelabs');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-eslint');

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
        webpack: {
            build: {
                progress: true,
                entry: {
                    background: './src/js/background.js',
                    options: './src/js/options.js',
                    popup: './src/js/options.js'
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

    grunt.registerTask('build', ['webpack', 'copy', 'htmlmin']);
    grunt.registerTask('test', ['connect', 'saucelabs-qunit']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', 'build');
};
