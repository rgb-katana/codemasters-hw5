/* eslint-disable @typescript-eslint/no-var-requires */
import * as webpack from 'webpack';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

enum Mode {
  Prod = 'production',
  Dev = 'development',
}

interface IEnvVariables {
  mode: Mode;
}

interface Config extends webpack.Configuration {
  devServer: DevServerConfiguration;
}

export default (env: IEnvVariables) => {
  const isDev = env.mode === Mode.Dev;

  const webpackConfig: Config = (module.exports = {
    mode: env.mode ?? 'development',

    entry: path.resolve(__dirname, 'src', 'index.ts'),

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
      new MiniCssExtractPlugin(),
    ],

    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },

    devServer: {
      port: '2000',
      open: true,
    },

    devtool: isDev ? 'inline-source-map' : undefined,
  });

  return webpackConfig;
};
