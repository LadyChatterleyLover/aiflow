/**
 * @file 开发配置
 * @author zhousheng
 */

 const HtmlWebpackPlugin = require('html-webpack-plugin');
 const path = require('path');

 const babelConfig = require('./babel.config.js');
 
 module.exports = {
    mode: 'production',
    cache: true,
    entry: {
        dag: './demo/dag',
        animate: './demo/animate',
        autosort: './demo/autosort',
        custom: './demo/custom',
        defaultTemplate: './demo/defaultTemplate',
        process: './demo/process'
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, 'output'),
        filename: 'demo/[name]/[name].js'
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
    plugins: [
        new HtmlWebpackPlugin({
            filename: './demo/dag/index.html',
            template: './demo/dag/index.html',
            chunks: ['dag']
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
