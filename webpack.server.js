const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const open = require('open');

const app = express();
const config = require('./webpack.config.dev.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

// Serve the files on port 9000.
var url = 'http://localhost:';
var port = 9000;
var path = '/';
app.listen(9000, function () {
  
  console.log('Example app listening on port '+port+'! yo\n');
  // open('http://localhost:9000/');
  open(url+port+path);
});