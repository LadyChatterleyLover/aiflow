/**
 * @file 开发配置
 * @author zhousheng
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelConfig = require('./babel.config.js');

module.exports = {
    mode: 'development',
    cache: true,
    entry: {
        index: './demo/dag',
        animate: './demo/animate',
        autosort: './demo/autosort',
        custom: './demo/custom',
        defaultTemplate: './demo/defaultTemplate',
        process: './demo/process'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        ...babelConfig
                    }
                }
            },
            {
                test: /\.less$/,
                use: [{
                    loader: 'style-loader'
                },
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'less-loader',
                    options: {
                        lessOptions: {
                            javascriptEnabled: true
                        }
                    }
                }]
            }
        ]
    },
    devtool: 'eval-source-map',
    devServer: {
        port: 9999,
        hot: true,
        host: '0.0.0.0',
        static: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: './demo/dag/index.html',
            template: './demo/dag/index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            filename: './demo/animate/index.html',
            template: './demo/animate/index.html',
            chunks: ['animate']
        }),
        new HtmlWebpackPlugin({
            filename: './demo/autosort/index.html',
            template: './demo/autosort/index.html',
            chunks: ['autosort']
        }),
        new HtmlWebpackPlugin({
            filename: './demo/custom/index.html',
            template: './demo/custom/index.html',
            chunks: ['custom']
        }),
        new HtmlWebpackPlugin({
            filename: './demo/defaultTemplate/index.html',
            template: './demo/defaultTemplate/index.html',
            chunks: ['defaultTemplate']
        }),
        new HtmlWebpackPlugin({
            filename: './demo/process/index.html',
            template: './demo/process/index.html',
            chunks: ['process']
        })
    ]
};