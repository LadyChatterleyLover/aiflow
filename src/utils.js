/**
 * @file utils
 * @author zhousheng
 */
import zrender, {vector, matrix} from 'zrender';

export function mergeArrays(...arr) {
    if (arr.length === 0) {
        throw new Error('数组为空');
    }
    let newArrars = [];
    try {
        for (let i = 0; i < arr.length; i++) {
            // arr[1] = 1,2,3
            for (let j = 0; j < arr[i].length; j++) {
                // newArrars[0] = arr[0][0];
                // newArrars[1] = arr[0][1];
                let number = Number(arr[i][j]);
                if (!isNaN(number)) {
                    if (!newArrars[j]) {
                        newArrars[j] = number;
                    }
                    else {
                        newArrars[j] += number;
                    }
                }
                else if (!newArrars[j]) {
                    newArrars[j] = arr[i][j];
                }
                else {
                    newArrars[j] += arr[i][j];
                }

            }
        }
    }
    catch (e) {
        console.log('遍历出问题了');
    }
    return newArrars;
}

/**
 * 根据贝塞尔曲线的起止点计算出两个控制点，修正节点间的连线
 *
 * @param {Array} start 起点坐标[x, y]
 * @param {Array} end 终点坐标[x, y]
 * @param {string=} direction 指向方向
 * @return {Array} 控制点数组，[[x1, y1], [x2, y2]]
 */
export function calcuBezizerControlPoints(start, end, direction) {
    let cp1 = start;
    let cp2 = end;
    switch (direction) {
        case 'top':
            cp1 = mergeArrays(start, [0, -20]);
            cp2 = mergeArrays(end, [0, 20]);
            break;
        case 'right':
            cp1 = mergeArrays(start, [20, 0]);
            cp2 = mergeArrays(end, [-20, 0]);
            break;
        case 'bottom':
            cp1 = mergeArrays(start, [0, 20]);
            cp2 = mergeArrays(end, [0, -20]);
            break;
        case 'left':
            cp1 = mergeArrays(start, [-20, 0]);
            cp2 = mergeArrays(end, [20, 0]);
            break;
        default:
            break;
    }
    return [cp1, cp2];
}

/**
 * 根据连线信息获取连线的全局起始坐标和箭头方向
 *
 * @param {Object} edge 连线 {src: '123:0', to: '12444:0'}
 * @param {string} edge.src 起点
 * @param {string} edge.to 终点
 * @param {Array<NodeView>} nodes 节点
 * @return {Object} 坐标
 * @param {Array<number>} start 起点坐标
 * @param {Array<number>} end 终点坐标
 * @param {Array<string>} pointTo 箭头方向
 */
export function calcuLinePoints(edge, nodes) {
    const srcInArray = edge.src.split(':');
    const distInArray = edge.to.split(':');
    const startNode = nodes.find(n => n.props.id === srcInArray[0]);
    const endNode = nodes.find(n => n.props.id === distInArray[0]);
    // 根据输入点即连线终点在box的上下左右位置，来设置连线的指向方向
    const pointToPosition = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right'
    };

    if (!startNode || !endNode) {
        return null;
    }
    // 如果没有指定输入点的位置，则默认是在bottom
    const pointTo = pointToPosition[endNode.props.config.inputCircle.circlePosition || 'bottom'];
    const startNodePosition = startNode.dom.group.position;
    const endNodePosition = endNode.dom.group.position;
    const startCircle = startNode.children.outputCircles[srcInArray[1]].dom;
    const start = startCircle.position;
    const startDistance = startCircle.shape.r + startCircle.style.lineWidth - 1;
    let startOffset = [0, 0];
    const endCircle = endNode.children.inputCircles[distInArray[1]].dom;
    const end = endCircle.position;
    const endDisatance = endCircle.shape.r + endCircle.style.lineWidth - 1;
    let endOffset = [0, 0];
    // 如果圆不可见，则不进行修正
    if (!startCircle.invisible) {
        switch (pointTo) {
            case 'top':
                startOffset = [0, -1 * (startDistance)];
                break;
            case 'right':
                startOffset = [startDistance, 0];
                break;
            case 'bottom':
                startOffset = [0, startDistance];
                endOffset = [0, -1 * endDisatance];
                break;
            case 'left':
                startOffset = [-1 * startDistance, 0];
                break;
        }
    }
    if (!endCircle.invisible) {
        switch (pointTo) {
            case 'top':
                endOffset = [0, endDisatance];
                break;
            case 'right':
                endOffset = [-1 * endDisatance, 0];
                break;
            case 'bottom':
                endOffset = [0, -1 * endDisatance];
                break;
            case 'left':
                endOffset = [endDisatance, 0];
                break;
        }
    }
    return {
        start: mergeArrays(startNodePosition, start, startOffset),
        end: mergeArrays(endNodePosition, end, endOffset),
        pointTo
    };
}

/**
 * 计算箭头的几个点的坐标
 *
 * @param {number} width 三角形宽度
 * @param {number} height 三角形高度
 * @param {Array<number>} apex 顶点坐标
 * @param {string} direction 顶点方向
 * @return {Array<Array<number>>} 三角形每个点的坐标
 */
export function cacluTrianglePoints(width, height, apex, direction) {
    const points = [];
    points.push(apex);
    switch (direction) {
        case 'top':
            points.push([apex[0] - width / 2, apex[1] + height]);
            points.push(apex[0] + width / 2, apex[1] + height);
            break;
        case 'right':
            points.push([apex[0] - height, apex[1] - width / 2]);
            points.push([apex[0] - height, apex[1] + width / 2]);
            break;
        case 'bottom':
            points.push([apex[0] - width / 2, apex[1] - height]);
            points.push([apex[0] + width / 2, apex[1] - height]);
            break;
        case 'left':
            points.push([apex[0] + height, apex[1] - width / 2]);
            points.push([apex[0] + height, apex[1] + width / 2]);
            break;
        default:
            points.push([apex[0] - width / 2, apex[1] - height]);
            points.push([apex[0] + width / 2, apex[1] - height]);
            break;
    }
    return points;
}

/**
 * 重新计算移动节点在画布中的位置
 *
 * @param {zrender.Displayable} zrNode 待移动node
 * @param {number} scale 缩放比例
 * @param {Object} mousedownEvent {e.zrX, e.zrY}
 * @return {Function} 计算mousemove时的位置函数
 */
export function prepareMoveNode(zrNode, mousedownEvent, options) {
    const oPos = [mousedownEvent.event.zrX, mousedownEvent.event.zrY];
    const rect = zrNode.getBoundingRect();
    zrNode.updateTransform();
    zrNode.transform && rect.applyTransform(zrNode.transform);
    const origTransform = matrix.create();
    zrNode.transform && matrix.copy(origTransform, zrNode.transform);
    const rectOrigMin = [rect.x, rect.y];
    const rectOrigMax = [rect.x + rect.width, rect.y + rect.height];
    const {
        cWidth,
        cHeight,
        dragWithinCanvas
    } = options;
    const ristrictMin = [0, 4];
    const ristrictMax = [cWidth, cHeight - 4];

    return function moveNode(workflowInstance, mousemoveEvent, diffPosition) {
        const workflowObj = workflowInstance.workflowObj;
        const node = workflowObj.nodes.find(n => {
            return n.dom.group.id === zrNode.id;
        });
        if (!node) {
            return;
        }
        const dataNode = workflowInstance.data.nodes.find(dataNode => node.props.id === dataNode.id);
        if (!diffPosition) {
            let delta = [
                mousemoveEvent.event.zrX - oPos[0],
                mousemoveEvent.event.zrY - oPos[1]
            ];

            const [deltaX, deltaY] = dragWithinCanvas ? delta.map((delta, index) => {
                if (delta < 0) {
                    if (rectOrigMin[index] < ristrictMin[index]) {
                        delta = 0;
                    }
                    else if (rectOrigMin[index]  + delta < ristrictMin[index]) {
                        delta = ristrictMin[index] - rectOrigMin[index];
                    }
                }
                else if (delta > 0) {
                    if (rectOrigMax[index] > ristrictMax[index]) {
                        delta = 0;
                    }
                    else if (rectOrigMax[index] + delta > ristrictMax[index]) {
                        delta = ristrictMax[index] - rectOrigMax[index];
                    }
                }
                return delta;
            }) : delta;
            zrNode.transform = zrNode.transform || matrix.create();
            matrix.copy(zrNode.transform, origTransform);
            zrNode.drift(deltaX, deltaY);
        }
        else {
            zrNode.drift(...diffPosition);
        }
        node.props.position = zrNode.position;
        dataNode.position = zrNode.position;
        zrNode.dirty();
        let n = workflowObj.nodes.find(n => {
            return n.dom.group.id === zrNode.id;
        });
        workflowInstance.triggerCustomEvent('dragNode', {target: n});
    };
}

/**
 * 从输出点开始拖动画直线
 *
 * @param {Object} outputCircle node输出口
 * @param {Object} drawGroup drawGroup
 * @param {Object} srcNode 输出点对象
 * @return {Function} mousemove时画线
 */
export function prepareCreateLine(outputCircle, drawGroup, srcNode, lineStyle = {}) {
    let circleParam = srcNode.props.config.outputCircle.normal;
    const parent = outputCircle.parent;
    parent.updateTransform();
    const m = parent.transform || matrix.create();
    const pos = [];
    vector.applyTransform(
        pos,
        vector.create(outputCircle.position[0], outputCircle.position[1] + circleParam.shape.r),
        m
    );
    let [lineX1, lineY1] = pos;

    return function createLine(zr, tempLine, mousemoveEvent) {
        let vector0 = zrender.vector.create(lineX1, lineY1);
        let vector1 = zrender.vector.create(mousemoveEvent.offsetX, mousemoveEvent.offsetY);
        tempLine && zr.remove(tempLine);
        if (zrender.vector.distance(vector1, vector0) > 10) {
            let line = new zrender.Line({
                shape: {
                    x1: lineX1,
                    y1: lineY1,
                    x2: mousemoveEvent.offsetX,
                    y2: mousemoveEvent.offsetY
                },
                style: lineStyle,
                z: 100000
            });
            zr.add(line);
            return line;
        }
    };
}

/**
 * 判断目标元素的类型 ["node", "edge"]
 *
 * @param {zrender.Displayable} zrElement workflow中保存的zrender图形实例
 * @param {Object} workflowInstance AIFlow实例
 * @return {string} 目标元素类型
 */
export function getElementType(zrElement, workflowInstance) {
    if (!zrElement || !zrElement.parent) {
        return '';
    }
    let workflowObj = workflowInstance.workflowObj;
    let type = '';
    let isNode = workflowObj.nodes.some(node => {
        if (node.dom.group.id === zrElement.parent.id) {
            return true;
        }
        return false;
    });

    let isEdge = workflowObj.edges.some(edge => {
        if (edge.dom.group.id === zrElement.parent.id) {
            return true;
        }
        return false;
    });

    type = isNode ? 'node' : (isEdge ? 'edge' : '');

    return type;
}

/**
 * 根据ZRender元素获取对应数据
 *
 * @param {zrender.Displayable} zrElement workflow中保存的zrender图形实例
 * @param {string} type 元素类型 ['node', 'edge']
 * @param {Object} workflowInstance AIFlow实例
 * @return {Object} 元素数据
 */
export function getDataByZrDom(zrElement, type, workflowInstance) {
    let groupId = zrElement.parent.id;
    let workflowObj = workflowInstance.workflowObj;
    if (type === 'node') {
        let node = workflowObj.nodes.find(node => node.dom.group.id === zrElement.parent.id);
        return {
            defineData: node.props.defineData,
            id: node.props.id
        };
    }
    else if (type === 'edge') {
        let edge = workflowObj.edges.find(edge => edge.dom.group.id === zrElement.parent.id);
        return {
            src: edge.props.src,
            to: edge.props.to
        };
    }
}


/**
 * 根据输入输出节点的ZRender Dom取得对应的node数据
 *
 * @param {zrender.Displayable} zrCircle 圆圈（输入输出点）的zrender图形实例
 * @param {Object} workflowInstance AIFlow实例
 * @return {Object} 元素数据
 */
export function getNodeByCircle(zrCircle, workflowInstance) {
    let zrNodes = workflowInstance.workflowObj.nodes;
    let node = zrNodes.find((node, index) => {
        return node.dom.group.id === zrCircle.parent.id;
    });
    return node;
}
