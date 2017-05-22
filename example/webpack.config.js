var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  entry: "./main.jsx",
  target:"web",
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-[hash].js",
    chunkFilename: "[id].[name]-[hash].js"
  },
  devServer: {
    contentBase: path.join(__dirname, "ui"),
    port: 1337
  },
  plugins:[
    new HtmlWebpackPlugin({
      title: 'redux-auto: example'
    })
  ],
  resolve:{
    alias:{
      'redux-auto':__dirname+'/../index.js',
    }
  },
  module:{
        loaders:[{
                    test: /\.jsx$/,
                    loader:"babel-loader",
                    exclude:"/node_modules/",
                    query:{
                        presets:["react", "es2015"]
                    }
                }]
    }
};
