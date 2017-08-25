# Minimal Bookmarks Tree [![Travis Build Status](https://api.travis-ci.org/rpkamp/chrome-minimal-bookmarks-tree.svg)](https://travis-ci.org/rpkamp/chrome-minimal-bookmarks-tree)

Minimal Bookmarks Tree is an extension for Google Chrome and can be found in the [Chrome Web Store](https://chrome.google.com/webstore/detail/mohenkbngkbmdlkiemonbgdfgdjacaeb).

## Development

To work on this project you need [Yarn][yarn].
Once you have that, run

```bash
yarn install
```

That will install all dependencies required for this project.

You will also need to install [grunt-cli][grunt-cli].

Once `yarn` and `grunt` are installed, you can edit the files in `src/`. When you are happy with your work run

```bash
grunt
```

to build a distribution from the sources. This will transpile the ES6 to ES5, compress the CSS,
minify the HTML and copy some vendor files to a distribution. The distribution wil be placed
in a `dist` folder in the project.
You can add now load the extension in Chrome by going to the [chrome extensions page][chrome-extensions],
tick "Developer mode" and click "Load unpacked extension...". In the file window select the `dist` directory.

## Grunt options
The following commands are available for `grunt`:

| option | description |
| --- | --- |
| build | transpiles the ES6 sources to ES5, minifies CSS, minifies HTML and copies vendor files to the `dist` directory. |
| lint | runs es-lint against the codebase |
| build-tests | transpiles the ES6 test files to ES5 |
| test | run eslint (`grunt lint`), build the test files (`grunt build-tests`) and run the test files in [Sauce Labs][sauce-labs] |
| pack | runs tests (`grunt test`), builds the project (`grunt build`), and packs the `dist` directory to `mbt.zip` for distribution |

For example, to run es-lint, type

```bash
grunt lint
```

## Running tests locally
To run the tests locally, first run

```bash
grunt build-tests
```

and then point your browser to

```bash
file:///path/to/minimal-bookmarks-tree/tests/index.html
```

The tests will run on that webpage.

## Running tests using Sauce Labs
To test against multiple versions of Chrome on different platforms using [Sauce Labs][sauce-labs],
you need an account with them. Once you do, make sure you are logged in and find your Access Key
under "my account".

When you've found the Access Key, run 

```bash
export saucekey=<your-key-here>
```

without this `saucekey` in your environment testing with Sauce Labs is not possible.

Once the key is set, you can run

```bash
grunt test
```

to run tests in sauce labs.

### Icons

Main icon: [https://www.iconfinder.com/icons/40698/bookmark_icon#size=128][main-icon]
Star: [https://www.iconfinder.com/icons/326703/favorite_rate_star_icon#size=128][star]
Open star: [https://www.iconfinder.com/icons/326487/rate_star_icon#size=128][open-star]

[yarn]: https://yarnpkg.com/lang/en/docs/install/
[grunt-cli]: http://gruntjs.com/getting-started#installing-the-cli
[chrome-extensions]: chrome://extensions/
[sauce-labs]: https://saucelabs.com/
[main-icon]: https://www.iconfinder.com/icons/40698/bookmark_icon#size=128
[star]: https://www.iconfinder.com/icons/326703/favorite_rate_star_icon#size=128
[open-star]: https://www.iconfinder.com/icons/326487/rate_star_icon#size=128
