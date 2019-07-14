# Minimal Bookmarks Tree 

![build status](https://img.shields.io/circleci/project/github/rpkamp/chrome-minimal-bookmarks-tree.svg) ![users](https://img.shields.io/chrome-web-store/users/mohenkbngkbmdlkiemonbgdfgdjacaeb.svg?label=users) ![rating](https://img.shields.io/chrome-web-store/stars/mohenkbngkbmdlkiemonbgdfgdjacaeb.svg)

Minimal Bookmarks Tree is an extension for Google Chrome and can be found in the [Chrome Web Store](https://chrome.google.com/webstore/detail/mohenkbngkbmdlkiemonbgdfgdjacaeb).

## Development

To work on this project you need [NPM][npm].
Once you have that, run

```bash
npm install
```

That will install all dependencies required for this project.

Now you can edit the files in `src/`. When you are happy with your work run

```bash
make build-dev
```

to build a distribution from the sources. This will transpile the ES6 to ES5, compress the CSS,
minify the HTML and copy some vendor files to a distribution. The distribution wil be placed
in a `dist/` folder in the project.
You can add now load the extension in Chrome by going to the [chrome extensions page][chrome-extensions],
tick "Developer mode" and click "Load unpacked extension...". In the file window select the `dist/` directory.

If you want to build for production mode and pack it up into a zip file run `make build` instead.

## Running tests locally
To run the tests locally, run

```bash
make test
```

## Translations

Translations for minimal bookmarks tree are managed using [OneSky][oneskyapp]. Please feel free to suggest alternate translations and/or languages!

## Icons

| Description | Icon | URL |
| --- | --- | --- |
| Main icon | ![main icon](src/icons/bookmark32.png) | [https://www.iconfinder.com/icons/40698/bookmark_icon#size=128][main-icon] |
| Star | ![star icon](src/icons/black-star.png) | [https://www.iconfinder.com/icons/326703/favorite_rate_star_icon#size=128][star] |
| Open star | ![open star icon](src/icons/black-open-star.png) | [https://www.iconfinder.com/icons/326487/rate_star_icon#size=128][open-star] |

White star and white open star are custom edits of the "Star" and "Open star" icons listed above.

## Donations

Like this extension? Buy me a coffee 🙂

[![Donate with PayPal](https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg)][donate]

[NPM]: https://www.npmjs.com/
[chrome-extensions]: chrome://extensions/
[sauce-labs]: https://saucelabs.com/
[oneskyapp]: https://minimalbookmarkstree.oneskyapp.com/collaboration/project?id=60763
[main-icon]: https://www.iconfinder.com/icons/40698/bookmark_icon#size=128
[star]: https://www.iconfinder.com/icons/326703/favorite_rate_star_icon#size=128
[open-star]: https://www.iconfinder.com/icons/326487/rate_star_icon#size=128
[donate]: https://paypal.me/rpkamp
