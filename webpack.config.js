const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'facebook-bot/handler': './facebook-bot/handler.js',
    'wit-ai/handler': './wit-ai/handler.js'
  },
  target: 'node',
  module: {
    loaders: [
      { test: /\.json/, loader: 'json-loader' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: '.env' }
    ])
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
};
