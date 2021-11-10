const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    app: './src/index'
  },
  output: {
    clean: true,
    filename: '[id].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'eval',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /bootstrap\.tsx$/, loader: 'bundle-loader', options: {
          lazy: true,
        },
      },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.css$/, use: ['style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: {
                tailwindcss: {},
                autoprefixer: {},
              },
            },
          },
        }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Five Dice Game',
      template: 'public/index.html',
    }),
  ],
}
