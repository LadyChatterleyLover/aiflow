/**
 * @file build配置
 * @author zhousheng
 */

const resolve = require('path').resolve;

const babelConfig = require('./babel.config.js');

module.exports = {
    mode: 'production',
    entry: [
        './src/index'
    ],
    output: {
        filename: 'aiflow.js',
        library: 'AIFlow',
        libraryTarget: 'umd',
        path: resolve(__dirname, 'dist/')
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
            }
        ]
    }
};
