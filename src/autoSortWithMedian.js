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
    const graphLayoutIns = new GraphLayout({
        compacted: false,
        numRepeat: option.numRepeat || 1,
        nodes: option.nodes,
        edges: option.edges,
        hryType: option.hryType
    });

    graphLayoutIns.render();

    let {
        horizontal = true,
        align = 'middle',
        beginX = 10,
        beginY = 10,
        spaceX = 200,
        spaceY = 100,
        overflow = 'default'
    } = option;

    const {cWidth, cHeight} = option;

    let coordX = 0;
    let coordY = 0;
    let newNodes = [];
    const maxOrder = Math.max(...graphLayoutIns.nodesLayer.map(list => list.length));

    if (align === 'middle') {
        option.nodes.forEach(node => {
            const list = graphLayoutIns.nodesLayer[node.level - 1];
            const orderNode = list.find(item => item.id === node.id);
            const delta =  (maxOrder - list.length) / 2;
            node.order = orderNode.x + delta;
        });
    }

    // 处理初始位置
    const graphLevel = graphLayoutIns.nodesLayer.length;
    const graphX = (maxOrder - 1) * spaceX;
    const graphY = (graphLevel - 1) * spaceY;
    const {
        width: nodeWidth,
        height: nodeHeight
    } = getNodeShape(option.nodes[0] || {});

    beginX = convertBeginPosition(overflow, graphX, beginX, nodeWidth, cWidth);
    beginY = convertBeginPosition(overflow, graphY, beginY, nodeHeight, cHeight);

    // 横排
    if (horizontal) {
        option.nodes.forEach(node => {
            const list = graphLayoutIns.nodesLayer[node.level - 1];
            const orderNode = list.find(item => item.id === node.id);
            node.order = orderNode.x;
            coordX = beginX + (node.level - 1) * spaceX;
            coordY = beginY + orderNode.x * spaceY;
            node.position = [coordX, coordY];
            let newNodeTemp = {};
            Object.assign(newNodeTemp, node);
            let nodeInputCircle = node.config.inputCircle;
            let nodeOutputCircle = node.config.outputCircle;
            let newNodeInputCircle = newNodeTemp.config.inputCircle;
            let newNodeOutputCircle = newNodeTemp.config.outputCircle;
            newNodeInputCircle.circlePosition = nodeInputCircle.horizontalCirclePosition
            || nodeInputCircle.circlePosition
            || 'left';
            newNodeOutputCircle.circlePosition = nodeOutputCircle.horizontalCirclePosition
            || nodeOutputCircle.circlePosition
            || 'right';
            newNodes.push(newNodeTemp);
        });
    }
    // 竖排
    else {
        option.nodes.forEach(node => {
            coordX = beginX + node.order * spaceX;
            coordY = beginY + (node.level - 1) * spaceY;
            node.position = [coordX, coordY];
            delete node.order;
            delete node.level;
            let newNodeTemp = {};
            Object.assign(newNodeTemp, node);
            let nodeInputCircle = node.config.inputCircle;
            let nodeOutputCircle = node.config.outputCircle;
            let newNodeInputCircle = newNodeTemp.config.inputCircle;
            let newNodeOutputCircle = newNodeTemp.config.outputCircle;

            newNodeInputCircle.circlePosition = nodeInputCircle.verticalCirclePosition
            || nodeInputCircle.circlePosition
            || 'top';
            newNodeOutputCircle.circlePosition = nodeOutputCircle.verticalCirclePosition
            || nodeOutputCircle.circlePosition
            || 'bottom';
            newNodes.push(newNodeTemp);
        });
    }
    let xArr = [];
    let yArr = [];
    newNodes.forEach(node => {
        xArr.push(node.position[0]);
        yArr.push(node.position[1]);
    });
    return newNodes;
}
