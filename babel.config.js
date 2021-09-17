/**
 * @file Babel configuration
 *
 * @author zhousheng
 */

module.exports = function (api) {
    api.cache(true);

    const presets = [
        '@babel/preset-typescript',
        '@babel/preset-react',
        ['@babel/preset-env', {
            targets: '> 0.25%, not dead',
            useBuiltIns: 'usage',
            corejs: '>3'
        }]
    ];

    const plugins = [
        '@babel/plugin-transform-runtime',
        ['babel-plugin-import', {libraryName: 'antd', style: true}]
    ];

    return {
        presets,
        plugins
    };
};
