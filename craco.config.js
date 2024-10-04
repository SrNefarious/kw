const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib')
      };

      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !(plugin instanceof webpack.DefinePlugin)
      );

      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env)
        })
      );

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      );

      return webpackConfig;
    },
  }
};
