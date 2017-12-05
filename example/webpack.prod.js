var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var SriPlugin = require( 'webpack-subresource-integrity');

module.exports = {
  entry: "./main.jsx",
  target:"web",
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-[hash].min.js",
    chunkFilename: "[id].[name]-[hash].min.js"
  },

  plugins: [
      new HtmlWebpackPlugin({
        showErrors:true,  template: 'index.html'
      }),
      new webpack.optimize.UglifyJsPlugin({sourceMap:true}),
      new SriPlugin({ hashFuncNames: ['sha256'] }) ],
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
                },{
                      test: /\.js$/,
                      loader:"babel-loader",
                      query:{
                          presets:["es2015"]
                      }
                  }]
    }
}
