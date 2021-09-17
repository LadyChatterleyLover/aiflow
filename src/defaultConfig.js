/**
 * @file defaultConfig 默认配置
 * @author zhousheng
 */

export const defaultGlobalConfig = {
    // 是否静态图片
    isStatic: false,
    // 关系映射方式 目前支持一对多(o2m)、多对多(m2m)、暂不支持多对一(m2o)、一对一(o2o),默认值o2m
    relationMapping: 'o2m',
    // 画布宽度
    cWidth: 500,
    // 画布高度
    cHeight: 500,
    // 整个图默认模版
    templateName: 'defaultTemplate',
    // 辅助线相关配置
    guideLine: {
        // 是否开启辅助线
        on: true,
        // 辅助线样式
        style: {
            stroke: '#1067EE',
            lineWidth: 1,
            lineDash: [4, 4]
        }
    },
    // 自动排序相关配置
    autoSort: {
        // 是否需要自动排序，true: 程序智能计算每个node的位置，false: 根据node position来定位
        on: false,
        // 是否水平排序，true: 水平排序，false: 垂直排序
        horizontal: true,
        // node对齐方式，start:水平排列时表示上对齐，垂直排列时表示左对齐 middle:中间对齐；end:水平排列时表示下对齐，垂直排列时表示右对齐
        align: 'middle',
        // 起点X坐标
        beginX: 20,
        // 起点Y坐标
        beginY: 20,
        // 横向间距，默认50
        spaceX: 50,
        // 纵向间距，默认20
        spaceY: 20
    },
    // 框选参数
    frameSelect: {
        // 样式
        style: {
            opacity: 0.2,
            fill: '#1067EE',
            stroke: '#000',
            lineWidth: 1
        }
    },
    // 临时线的样式, 配置参考 zrender.Displayable opts.style https://ecomfe.github.io/zrender-doc/public/api.html#zrenderdisplayable
    templineStyle: {
        stroke: '#108cee',
        lineWidth: 1
    },
    pan: {
        // 添加默认的pan事件，即在框选不打开和没有节点选中时，平移整个图
        default: false
    },
    zoom: {
        // 添加默认的缩放事件
        default: false,
        // 默认最小缩放
        minScale: 0.2,
        // 默认最大缩放
        maxScale: 5
    },
    // 拖动节点时，检测并限制节点不移动到canvas外部
    dragWithinCanvas: true
};
