/**
 * @file build配置
 * @author zhousheng
 */

const resolve = require('path').resolve;

const babelConfig = require('./babel.config.js');

module.exports = {
    mode: 'production',
    entry: './src/index',
    output: {
        library: {
            type: 'commonjs'
        },
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
