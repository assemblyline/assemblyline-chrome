var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname + "/src",
  entry: {
    content: "./content",
    background: "./background",
    options: "./options",
  },
  output: {
    path: __dirname + "/build",
    filename: "[name].js",
  },
  module: {
    loaders: [
      { test: /\.hbs$/, loader: "handlebars-template-loader" },
      { test: /\.js$/, loader: "uglify" },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
          { from: "images", to: "images" },
          { from: "manifest.json" },
          { from: "options.html" },
          { from: "content.css" },
    ]),
  ],
  node: { fs: "empty" }
};
