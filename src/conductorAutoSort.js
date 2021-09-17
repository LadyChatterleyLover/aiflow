/**
 * @file autoSortWithMedian
 * @author dailin
 */

import zrender from 'zrender';

import {GraphLayout} from './graphLogic/GraphLayout';

/**
 * 智能排列
 * @param {Object} option 参数描述
 * @param {Array} option.nodes 节点信息
 * @param {Array} option.edges 关系数组
 * @param {boolean=} option.horizontal true:水平排列,false:垂直排列
 * @param {align=} option.align middle:中间对齐 start:左对齐或上对齐 end:右对齐或下对齐
 * @param {number=} option.cWidth 画布宽度
 * @param {number=} option.cHeight 画布高度
 * @param {number=} option.beginX 起点X坐标，默认10 number | 'center' | 'left' | 'right'
 * @param {number=} option.beginY 起点Y坐标，默认10 number | 'middle' | 'top' | 'bottom'
 * @param {number=} option.spaceX 横向间距，默认200
 * @param {number=} option.spaceY 纵向间距，默认100
 * @param {boolean} isLast
 * @param {string} overflow 超出画布 默认'default'(变成0) | justify(自动左上角移动) | hidden(隐藏)
 * @return {Object} 返回带position属性的nodes
 */

function getNodeShape(node = {}) {
    const keyPath = ['config', 'box', 'normal', 'shape'];
    return keyPath.reduce((pre, key) => {
        return pre[key] || {};
    }, node);
}

function justifyPosition(type, max, begin, nodeWidth, total) {
    if ((max + begin + nodeWidth) > total) {
        switch (type) {
            case 'justify':
                return Math.max(total - max - nodeWidth, 0);
            case 'default':
                return 0;
            default:
                break;
        }
    }
    return begin;
}

function convertBeginPosition(overflow, max, begin, nodeWidth, total) {
    let newBegin = begin;
    switch (begin) {
        case 'center':
        case 'middle':
            newBegin = Math.max((total - max - nodeWidth) / 2, 0);
            break;
        case 'left':
        case 'top':
            newBegin = 0;
            break;
        case 'right':
        case 'bottom':
            newBegin = Math.max(total - max - nodeWidth, 0);
            break;
        default:
            break;
    }
    // 计算BeginXY的合理性
    return justifyPosition(overflow, max, newBegin, nodeWidth, total);
}

export default function autoSortWithMedian(option) {
    const nodeWidth = 160;
    const nodeHeight = 50;
    const spaceX = 30;
    const spaceY = 50;
    let {
        beginX = 10,
        beginY = 10,
        nodes,
        edges
    } = option;
    const graphLayoutIns = new GraphLayout({
        compacted: false,
        numRepeat: option.numRepeat || 1,
        nodes,
        edges
    });

    graphLayoutIns.render();
    // 竖排
    const list = graphLayoutIns.nodesLayer;
    // 排序
    list.forEach((item, index) => {
        item.index = index;
    });
    list.sort((a, b) => b.index - a.index);
    // const positionArr = [];
    let y = beginY;
    let maxX = 0;
    let layerMaxXArr = [];
    list.forEach((arr, index) => {
        let x = beginX;
        let maxH = 0;
        arr.filter(node => node.id).map(node => {
            const n = nodes.find(n => n.id === node.id);
            const {
                width = nodeWidth,
                height = nodeHeight
            } = n;
            n.x = x;
            n.y = y;
            x += width + spaceX;
            maxH = Math.max(maxH, height);
            return node;
        }).forEach(node => {
            const n = nodes.find(n => n.id === node.id);
            const {
                // width = nodeWidth,
                height = nodeHeight
            } = n;
            n.y += (maxH - height);
        });
        layerMaxXArr[index] = x;
        maxX = Math.max(maxX, x);
        y += maxH + spaceY;
    });
    list.forEach((arr, index) => {
        const deltaX = (maxX - layerMaxXArr[index]) / 2;
        arr.filter(node => node.id).forEach(node => {
            const n = nodes.find(n => n.id === node.id);
            n.x += deltaX;
        });
    });
    // return nodes;
    const nodesMap = new Map();
    nodes.forEach(({id, x, y}) => {
        nodesMap.set(id, {positionX: x, positionY: y});
    });
    return nodesMap;
}
