const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    'index': './src/index.jsx',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      }
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "screenly.yml",
          to: "screenly.yml",
        },
        {
          from: "instance.yml",
          to: "instance.yml",
        },
        {
          from: "src/img",
          to: "img",
        }
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['index']
    }),

    new MiniCssExtractPlugin(),

    new RemovePlugin({
      before: {
        include: ['dist']
      },
      after: {
      }
    })
  ],

  resolve: {
    alias: {
      '@/store': path.resolve(__dirname, 'src/assets/ts/store.ts'),
      '@/main': path.resolve(__dirname, 'src/assets/ts/main.ts'),
      '@/components': path.resolve(__dirname, 'src/assets/ts/components'),
      '@/features': path.resolve(__dirname, 'src/assets/ts/features'),
      '@/scss': path.resolve(__dirname, 'src/assets/scss'),
      '@/vendor': path.resolve(__dirname, 'src/lib/vendor'),
    },
    extensions: ['.js', '.jsx'],
  },

  watchOptions: {
    ignored: /node_modules/,
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
