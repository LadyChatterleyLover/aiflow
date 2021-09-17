/**
 * @file OptionsManager
 * @author zhousheng
 */

/**
 * OptionsManager 配置管理
 *
 * @class OptionManager
 */

import zrender from 'zrender';

import {defaultGlobalConfig} from './defaultConfig';

export default class OptionsManager {
    constructor(options) {
        const defaultConf = zrender.util.clone(defaultGlobalConfig);
        this.options = zrender.util.merge(defaultConf, options, true);
    }

    /**
     * 获取zrender的配置参数
     *
     * @return {Object} zrender配置参数
     */
    getZrOptions() {
        const zrDefaltOptions = {
            renderer: 'canvas',
            devicePixelRatio: window.devicePixelRatio,
            width: this.options.cWidth,
            height: this.options.cHeight
        };
        if (!this.zrOptions) {
            const keys = Object.keys(zrDefaltOptions);
            this.zrOptions = Object.assign({}, zrDefaltOptions);
            keys.forEach(key => {
                if (this.options[key]) {
                    this.zrOptions[key] = this.options[key];
                }
            });
        }
        return this.zrOptions;
    }
}
