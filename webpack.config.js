var Encore = require('@symfony/webpack-encore');

Encore
  .disableSingleRuntimeChunk()
  .enableVersioning(false)
  .configureManifestPlugin((options) => {
    options.fileName = 'webpack-manifest.json';
  })

  .setOutputPath('dist/')
  .setPublicPath('/')

  .addStyleEntry('browser_action_css', './src/browser_action/main.scss')
  .addStyleEntry('options_css', './src/options/main.scss')

  .addEntry('browser_action', './src/browser_action/index.js')
  .addEntry('background', './src/background/index.js')
  .addEntry('options', './src/options/index.js')
  .addEntry('tests', './tests/src/tests.js')

  .copyFiles([
    {
      from: './src/icons',
      to: 'icons/[path][name].[ext]'
    },
    {
      from: './src/_locales',
      context: 'src/'
    },
    {
      from: './src/',
      pattern: /\.json$/,
      includeSubdirectories: false
    },
    {
      from: './src/background',
      pattern: /\.html$/,
      includeSubdirectories: false
    },
    {
      from: './src/browser_action',
      pattern: /\.html$/,
      includeSubdirectories: false
    },
    {
      from: './src/options',
      pattern: /\.html$/,
      includeSubdirectories: false
    }
  ])

  .enableSassLoader()
  .enableEslintLoader()

  .enableSourceMaps(!Encore.isProduction())
  .cleanupOutputBeforeBuild()
  .configureFilenames({
    js: '[name].js',
    css: '[name].css'
  })
;

module.exports = Encore.getWebpackConfig();
