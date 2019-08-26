const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');

const projectName = 'btx-graph';

// paths
const dirNode = 'node_modules';
const dirDist = path.resolve(__dirname, 'dist');
const dirEntry = path.resolve(__dirname, 'src/index.jsx');
const dirIndex = path.resolve(__dirname, 'src/index.html');



module.exports = {
  mode: 'production',
  entry: [
    dirEntry
  ],
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({title: projectName, template: dirIndex}),
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin([
      {from:'src/images',to:'images'},
      // {from:'src/data',to:'data'}
    ]), 
    new ZipPlugin({
      filename: projectName + '.zip',
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: dirDist,
    publicPath: './'
  },
  module: {
    rules: [
      {
        test : /\.jsx?/,
        loader : 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader" // creates style nodes from JS strings
        }, {
            loader: "css-loader" // translates CSS into CommonJS
        }, {
            loader: "sass-loader" // compiles Sass to CSS
        }]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  }
};
