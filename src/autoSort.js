/**
 * @file autosort
 * @author zhousheng
 */

import {util} from 'zrender';

/**
 * 智能排列
 *
 * @param {Object} option 参数描述
 * @param {Array} option.nodes 节点信息
 * @param {Array} option.edges 关系数组
 * @param {boolean=} option.horizontal true:水平排列,false:垂直排列
 * @param {align=} option.align middle:中间对齐 start:左对齐或上对齐 end:右对齐或下对齐
 * @param {number=} option.cWidth 画布宽度
 * @param {number=} option.cHeight 画布高度
 * @param {number=} option.beginX 起点X坐标，默认10
 * @param {number=} option.beginY 起点Y坐标，默认10
 * @param {number=} option.spaceX 横向间距，默认200
 * @param {number=} option.spaceY 纵向间距，默认100
 * @return {Object} 返回带position属性的nodes
 */
export default function autosort(option, isLast) {
    option.nodes.forEach(node => {
        node.level = 1;
    });
    let srcNode = null;
    let toNode = null;
    // 深度
    let depth = 1;
    // 递归遍历，寻找最大深度
    function getSrcIds(id, preArr, nodeParents) {
        const edges = option.edges;
        edges.forEach(edge => {
            if (edge.to.split(':')[0] === id) {
                // 遇到一个，裂变一个数组
                let tempArr = util.clone(preArr);
                nodeParents[nodeParents.length] = tempArr;
                const srcId = edge.src.split(':')[0];
                tempArr.push(srcId);
                getSrcIds(srcId, tempArr, nodeParents);
            }
        });
    }
    // 确定level，遍历node
    option.nodes.forEach(node => {
        const nodeParents = [];
        getSrcIds(node.id, [node.id], nodeParents);
        node.nodeParents = nodeParents;
        const nodeDepthArr = nodeParents.map(item => item.length);
        node.level = Math.max(...nodeDepthArr, 1);
    });
    // 确定最大深度
    depth = Math.max(...option.nodes.map(node => node.level), 1);
    // 宽度数组
    const widthArr = new Array(depth);
    let tempNode;
    let outIndex = 0;
    let inIndex = 0;
    const outLength = option.nodes.length;
    // 给每个node确定父节点集合和子节点集合
    option.edges.forEach(edge => {
        const [srcId, srcPort] = edge.src.split(':');
        const [toId, toPort] = edge.to.split(':');
        option.nodes.forEach(cNode => {
            if (cNode.id === srcId) {
                srcNode = cNode;
            }
            else if (cNode.id === toId) {
                toNode = cNode;
            }
        });
        if (!srcNode || !toNode) {
            return;
        }
        srcNode.children = [
            ...(srcNode.children || []),
            {
                id: toNode.id,
                toPort,
                order: toNode.order
            }
        ];
        toNode.parents = [
            ...(toNode.parents || []),
            {
                id: srcNode.id,
                srcPort,
                order: srcNode.order
            }
        ];
    });
    // 如果没有子节点，父节点，设置为空数组
    option.nodes.forEach(node => {
        if (node.children === undefined) {
            node.children = [];
        }
        if (node.parents === undefined) {
            node.parents = [];
        }
    });
    // 按level排序
    for (outIndex = 0; outIndex < outLength - 1; outIndex++) {
        for (inIndex = 0; inIndex < outLength - 1 - outIndex; inIndex++) {
            if (option.nodes[inIndex].level > option.nodes[inIndex + 1].level) {
                tempNode = option.nodes[inIndex];
                option.nodes[inIndex] = option.nodes[inIndex + 1];
                option.nodes[inIndex + 1] = tempNode;
            }
        }
    }
    // 第一层按子节点个数降序排列
    for (outIndex = 0; outIndex < outLength - 1; outIndex++) {
        for (inIndex = 0; inIndex < outLength - 1 - outIndex; inIndex++) {
            if (option.nodes[inIndex].level === 1 && option.nodes[inIndex + 1].level === 1) {
                if (option.nodes[inIndex].children.length < option.nodes[inIndex + 1].children.length) {
                    tempNode = option.nodes[inIndex];
                    option.nodes[inIndex] = option.nodes[inIndex + 1];
                    option.nodes[inIndex + 1] = tempNode;
                }
            }
        }
    }
    const levelOneZeroArr = option.nodes.filter(node => node.level === 1 && !node.children.length);
    if (levelOneZeroArr.length > 1) {
        const levelOneNoneZeroArr = option.nodes.filter(node => node.level === 1 && node.children.length);
        const oneLevelLen = levelOneNoneZeroArr.length + levelOneZeroArr.length;
        const centerIndex = Math.round(levelOneNoneZeroArr.length / 2);
        const preZeroArr = levelOneZeroArr.slice(0, centerIndex);
        const afterZeroArr = levelOneZeroArr.slice(centerIndex);
        option.nodes = option.nodes.slice(oneLevelLen);
        option.nodes.unshift(...preZeroArr, ...levelOneNoneZeroArr, ...afterZeroArr);
    }
    // 设置node order
    option.nodes.forEach(node => {
        let level = node.level;
        widthArr[level - 1] = widthArr[level - 1] === undefined ? 1 : widthArr[level - 1] + 1;
        node.order = widthArr[level - 1];
    });

    // 对于相同父节点的nodes的排序
    function sortSameNode(nodes, pId) {
        const orders = nodes.map(node => node.order).sort((a, b) => a - b);
        nodes.sort((nodeA, nodeB) => {
            const aP = nodeA.parents.find(p => p.id === pId);
            const bP = nodeB.parents.find(p => p.id === pId);
            return aP.srcPort - bP.srcPort;
        });
        nodes.forEach((node, index) => {
            node.order = orders[index];
        });
    }
    // 如果两个节点有相同的父节点，按port来排序，避免交叉
    for (let tempLevel = 1; tempLevel <= depth; tempLevel++) {
        const levelNodes = option.nodes.filter(node => node.level === tempLevel);
        const preNodes = option.nodes.filter(node => node.level < tempLevel);
        preNodes.forEach(preNode => {
            const sameSrcNodes = levelNodes.filter(levelNode =>
                levelNode.parents.some(pNode => pNode.id === preNode.id));
            if (sameSrcNodes.length > 1) {
                sortSameNode(sameSrcNodes, preNode.id);
            }
        });
    }

    let {horizontal = true, align = 'middle', beginX = 10, beginY = 10, spaceX = 200, spaceY = 100} = option;
    let coordX = 0;
    let coordY = 0;
    let newNodes = [];
    const maxOrder = Math.max(...widthArr);
    if (align === 'middle') {
        option.nodes.forEach(node => {
            const {level, order} = node;
            const delta =  (maxOrder - widthArr[level - 1]) / 2;
            node.order = order + delta;
        });
    }
    else if (align === 'end') {
        option.nodes.forEach(node => {
            const {level, order} = node;
            const delta =  maxOrder - widthArr[level - 1];
            node.order = order + delta;
        });
    }

    // 横排
    if (horizontal) {
        option.nodes.forEach(node => {
            coordX = beginX + (node.level - 1) * spaceX;
            coordY = beginY + (node.order - 1) * spaceY;
            // node.position = [coordX, coordY];
            node.x = coordX;
            node.y = coordY;
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
            coordX = beginX + (node.order - 1) * spaceX;
            coordY = beginY + (node.level - 1) * spaceY;
            // node.position = [coordX, coordY];
            node.x = coordX;
            node.y = coordY;
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
        // xArr.push(node.position[0]);
        xArr.push(node.x);
        // yArr.push(node.position[1]);
        yArr.push(node.y);
    });
    let maxX = Math.max(...xArr);
    let maxY = Math.max(...yArr);
    const {cWidth, cHeight} = option;

    if (isLast || maxX < cWidth && maxY < cHeight) {
        return newNodes;
    }
    if (maxX > cWidth) {
        beginX = Math.max(beginX - (maxX - cWidth), 0);
    }
    if (maxY > cHeight) {
        beginY = Math.max(beginY - (maxY - cHeight), 0);
    }
    option.beginX = beginX;
    option.beginY = beginY;
    return autosort(option, true);
}
