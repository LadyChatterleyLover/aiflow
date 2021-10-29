
/**
 * @file workflow
 * @author zhousheng
 */

import {Rect, matrix, Group, Line} from 'zrender';

import * as utils from '../utils';

export default class ZrEventManager {
    constructor(aiflowIns) {
        const {workflowObj, dom, optionsManager, drawGroup} = aiflowIns;
        this.aiflowIns = aiflowIns;
        this.optionsManager = optionsManager;
        this.isStatic = optionsManager.options.isStatic;
        this.guideLine = optionsManager.options.guideLine;
        this.relationMapping = optionsManager.options.relationMapping;
        this.workflowObj = workflowObj;
        this.drawGroup = drawGroup;
        this.dom = dom;
        this.zr = aiflowIns._zr;
        this.isNodeActive = false;
        this.dragGroup = null;
        this.moveNode = null;
        this.moveNodes = [];
        this.diffPosition = [0, 0];
        this.guideLineIns = null;

        // 画线
        this.tempEdgeSrc = '';
        this.tempEdgedst = '';
        this.createLine = null;
        this.hasLine = false;
        this.tempLine = null;

        // 可连接circle集合
        this.inputGuideCircles = [];

        this.setEventStyle();

        this.zr.on('mousedown', e => {
            aiflowIns.triggerCustomEvent('mousedown', e);
            this.mouseDownHandler(e);
        });

        this.zr.on('mouseup', e => {
            aiflowIns.triggerCustomEvent('mouseup', e);
            this.mouseUpHandler(e);
        });

        this.zr.on('click', e => {
            aiflowIns.triggerCustomEvent('click', e);
            this.clickHandler(e);
        });

        this.zr.on('mousemove', e => {
            aiflowIns.triggerCustomEvent('mousemove', e);
            this.mouseMoveHandler(e);
        });

        this.zr.on('mouseout', e => {
            aiflowIns.triggerCustomEvent('mouseout', e);
            this.mouseOutHandler(e);
        });

        this.zr.on('contextmenu', e => {
            aiflowIns.triggerCustomEvent('contextmenu', e);
            this.contextmenuHandler(e);
        });

        this.zr.on('mousewheel', e => {
            aiflowIns.triggerCustomEvent('zoom', e);
        });

        this._resolvePan(aiflowIns);
    }
    _resolvePan(aiflowIns) {
        let dragging = false;
        let prevPos = null;
        this.zr.on('mousedown', e => {
            dragging = true;
            prevPos = {
                x: e.event.zrX,
                y: e.event.zrY
            };
        });
        this.zr.on('mouseup', e => {
            dragging = false;
        });
        this.zr.on('mousemove', e => {
            if (dragging) {
                e = Object.create(e);
                e.deltaX = e.event.zrX - prevPos.x;
                e.deltaY = e.event.zrY - prevPos.y;
                prevPos = {
                    x: e.event.zrX,
                    y: e.event.zrY
                };
                if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
                    aiflowIns.triggerCustomEvent('pan', e);
                }
            }
        });
    }
    setIsStatic(isStatic) {
        this.isStatic = isStatic;
    }
    setDragNode(dragNode, e) {
        this.isNodeActive = true;
        this.dragGroup = dragNode.dom.group;
        dragNode.selected = true;
        this.aiflowIns.triggerCustomEvent('nodeSelected', dragNode);
        this.setNodeSelectedStyle(dragNode);
        this.moveNode = utils.prepareMoveNode(this.dragGroup, e, this.optionsManager.options);
    }
    calLinePoint(x, y, width, height) {
        const {cWidth, cHeight} = this.optionsManager.options;
        const shape1 = {
            x1: 0,
            y1: y,
            x2: cWidth,
            y2: y
        };
        const shape2 = {
            x1: x + width,
            y1: 0,
            x2: x + width,
            y2: cHeight
        };
        const shape3 = {
            x1: 0,
            y1: y + height,
            x2: cWidth,
            y2: y + height
        };
        const shape4 = {
            x1: x,
            y1: 0,
            x2: x,
            y2: cHeight
        };
        return [
            shape1,
            shape2,
            shape3,
            shape4
        ];
    }
    createGuideLine(x, y, width, height) {
        const shapeArr = this.calLinePoint(x, y, width, height);
        const guideGroup = new Group();
        shapeArr.forEach(shape => {
            guideGroup.add(new Line({
                style: this.guideLine.style,
                shape,
                z: 100000
            }));
        });
        this.zr.add(guideGroup);
        return guideGroup;
    }
    updateGuideLine(x, y, width, height) {
        const shapeArr = this.calLinePoint(x, y, width, height);
        const lineInsArr = this.guideLineIns.children();
        lineInsArr.forEach((lineIns, index) => {
            lineIns.attr({
                shape: shapeArr[index]
            });
        });
        this.guideLineIns.dirty();
    }
    setGuideLine(position, shape) {
        const [x, y] = position;
        const {width, height} = shape;
        if (!this.guideLineIns) {
            this.guideLineIns = this.createGuideLine(x, y, width, height);
            return;
        }
        this.updateGuideLine(x, y, width, height);
    }
    prepareMoveFrame(zrNode, mousedownEvent) {
        const oPos = [mousedownEvent.event.zrX, mousedownEvent.event.zrY];
        const rect = zrNode.getBoundingRect();
        zrNode.updateTransform();
        zrNode.transform && rect.applyTransform(zrNode.transform);
        const origTransform = matrix.create();
        zrNode.transform && matrix.copy(origTransform, zrNode.transform);
        const rectOrigMin = [rect.x, rect.y];
        const rectOrigMax = [rect.x + rect.width, rect.y + rect.height];
        const {dragWithinCanvas, cWidth, cHeight} = this.optionsManager.options;
        const ristrictMin = [0, 0];
        const ristrictMax = [cWidth - 10, cHeight - 10];
        return function moveFrame(mousemoveEvent) {
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
            zrNode.dirty();
            if (this.guideLine.on) {
                const {position, shape} = zrNode;
                this.setGuideLine(position, shape);
            }
            this.diffPosition = [deltaX, deltaY];
            // endMove && this.endFrameMove();
        };
    }
    endFrameMove(e) {
        if (this.moveNodes.length) {
            this.moveNodes.forEach(moveNode => {
                moveNode(this.aiflowIns, e, this.diffPosition);
            });
            this.freshEdges();
            this.zr.remove(this.frameSelectMoveIns);
            this.frameMove = null;
            this.diffPosition = [0, 0];
        }
        if (this.guideLineIns) {
            this.zr.remove(this.guideLineIns);
            this.guideLineIns = null;
        }
    }
    createFrameSelectMove(e, mulGraphNodes) {
        const xArr = [];
        const yArr = [];
        const xMaxArr = [];
        const yMaxArr = [];
        mulGraphNodes.forEach(node => {
            const group = node.dom.group;
            const rect = group.getBoundingRect();
            group.updateTransform();
            group.transform && rect.applyTransform(group.transform);
            const {x, y, width, height} = rect;
            const xMax = x + width;
            const yMax = y + height;
            xArr.push(x);
            yArr.push(y);
            xMaxArr.push(xMax);
            yMaxArr.push(yMax);
        });
        const xMin = Math.min(...xArr);
        const yMin = Math.min(...yArr);
        const xMax = Math.max(...xMaxArr);
        const yMax = Math.max(...yMaxArr);
        const nodeWidth = xMax - xMin;
        const nodeHeight = yMax - yMin;
        this.frameSelectMoveIns = new Rect({
            invisible: true,
            shape: {
                x: 0,
                y: 0,
                width: nodeWidth,
                height: nodeHeight
            },
            style: this.optionsManager.options.frameSelect.style,
            z: 100000
        });
        // this.frameSelectMoveIns.position = [xMin, yMin];
        this.frameSelectMoveIns.x = xMin;
        this.frameSelectMoveIns.y = yMin;
        this.zr.add(this.frameSelectMoveIns);
        this.frameMove = this.prepareMoveFrame(this.frameSelectMoveIns, e);
    }
    mouseDownHandler(e) {
        if (!e.target) {
            return;
        }
        this.isNodeActive = true;
        this.inputGuideCircles.forEach(guide => {
            const node = utils.getNodeByCircle(guide, this.aiflowIns);
            this.setElementStyle(guide, node.props.config.inputCircle.normal);
        });
        this.inputGuideCircles = [];
        const {outputCircle, srcNode, inputGuideCircles, srcStr} = this.getEdgeSrcNode(e);
        this.inputGuideCircles = inputGuideCircles;
        if (srcStr !== '') {
            const {templineStyle} = this.optionsManager.options;
            this.tempEdgeSrc = srcStr;
            this.createLine = utils.prepareCreateLine(outputCircle, this.drawGroup, srcNode, templineStyle);
            // Hilight avaliable input circle in other nodes
            this.inputGuideCircles.forEach(guide => {
                this.setElementStyle(guide, srcNode.props.config.inputCircle.guide);
            });
        }

        // 是否选中node
        let elementType = utils.getElementType(e.target, this.aiflowIns);
        if (elementType === 'node') {
            this.dragGroup = e.target.parent;
            // this.dragNode
            const dragNode = this.workflowObj.nodes.find(node => node.dom.group.id === this.dragGroup.id);
            // this.dragged = dragNode;
            const mulGraphNodes = this.aiflowIns.getGraphMulNodes();
            const mulContainDrag = mulGraphNodes.some(graphNode => graphNode.props.id === dragNode.props.id);
            if (!this.aiflowIns.isMul && !mulContainDrag && mulGraphNodes.length) {
                this.aiflowIns.clearMulNodes();
            }
            if (mulGraphNodes.length && mulContainDrag) {
                this.moveNodes = mulGraphNodes.map(graphNode =>
                    utils.prepareMoveNode(graphNode.dom.group, e, this.optionsManager.options));
                this.createFrameSelectMove(e, mulGraphNodes);
            }
            else {
                this.moveNode = utils.prepareMoveNode(this.dragGroup, e, this.optionsManager.options);
            }
        }
    }

    mouseUpHandler(e) {
        this.tempLine && this.zr.remove(this.tempLine);
        this.inputGuideCircles.forEach(guide => {
            let node = utils.getNodeByCircle(guide, this.aiflowIns);
            this.setElementStyle(guide, node.props.config.inputCircle.normal);
        });
        this.inputGuideCircles = [];
        if (this.hasLine && !this.checkEdge(this.tempEdgeSrc, this.tempEdgedst)) {
            let edgeItem = {
                src: this.tempEdgeSrc,
                to: this.tempEdgedst
            };
            this.aiflowIns.addEdge(edgeItem);
        }
        this.endFrameMove(e);
        this.dragNodeEnd();
        this.isNodeActive = false;
        this.dragGroup = null;
        this.hasLine = false;
        this.tempEdgeSrc = '';
        this.tempEdgedst = '';
        this.createLine = null;
        this.tempLine = null;
    }
    clickHandler(e) {
        if (!e.target) {
            this.clearSelectedNodeAndEdge();
        }
    }

    mouseMoveHandler(e) {
        if (this.isStatic) {
            return false;
        }
        let inEndCircle;
        this.workflowObj.nodes.forEach(node => {
            let inputCircleStyle = node.props.config.inputCircle;
            node.dom.inputCircles
            && node.dom.inputCircles.forEach((inputCircle, inputIndex) => {
                if (this.inputGuideCircles.includes(inputCircle)) {
                    if (inputCircle.contain(e.offsetX, e.offsetY)) {
                        this.setElementStyle(inputCircle, inputCircleStyle.guideHover || inputCircleStyle.guide);
                        this.tempEdgedst = node.props.id + ':' + inputIndex;
                        inEndCircle = true;
                    }
                    else {
                        this.setElementStyle(inputCircle, inputCircleStyle.guide);
                    }
                }
            });
        });

        if (!this.isNodeActive) {
            return;
        }

        // 画线
        if (typeof this.createLine === 'function') {
            this.tempLine = this.createLine(this.zr, this.tempLine, e);
            this.hasLine = !!inEndCircle;
            return;
        }

        // 移动node group
        if (!this.isStatic && this.dragGroup) {
            if (this.moveNodes.length) {
                this.frameSelectMoveIns.attr('invisible', false);
                this.frameMove(e);
            }
            else if (this.moveNode) {
                this.moveNode(this.aiflowIns, e);
                const dragNode = this.workflowObj.nodes.find(node => node.dom.group.id === this.dragGroup.id);
                const dragNodeId = dragNode.props.id;
                if (this.guideLine.on) {
                    const {group, box} = dragNode.dom;
                    const rect = group.getBoundingRect();
                    group.updateTransform();
                    group.transform && rect.applyTransform(group.transform);
                    const {x, y, width, height} = rect;
                    this.setGuideLine([x, y], {
                        width,
                        height
                    });
                }
                this.freshEdges(dragNodeId);
            }
        }
    }

    mouseOutHandler(e) {
        // const event = e.event;
        // const {zrX, zrY} = event;
        // if (zrX < 0 || zrY < 0) {
        //     this.dragGroup = null;
        // }
    }
    dragNodeEnd() {
        // this.dragGroup
        if (this.dragGroup) {
            const dragNode = this.workflowObj.nodes.find(node => node.dom.group.id === this.dragGroup.id);
            const mulGraphNodes = this.aiflowIns.getGraphMulNodes();
            const mulContainDrag = mulGraphNodes.some(graphNode => graphNode.props.id === dragNode.props.id);
            if (mulGraphNodes.length && mulContainDrag) {
                this.aiflowIns.triggerCustomEvent('dragNodeEnd', {target: mulGraphNodes});
            }
            else {
                this.aiflowIns.triggerCustomEvent('dragNodeEnd', {target: [dragNode]});
            }
        }
        if (this.moveNode) {
            this.moveNode = null;
        }
        else if (this.moveNodes.length) {
            this.moveNodes = [];
        }
    }
    contextmenuHandler(e) {
        e.event.preventDefault();
        this.dragGroup = null;
        this.isNodeActive = false;
        this.dragNodeEnd();
    }

    freshEdges(nodeId) {
        let workflowObj = this.aiflowIns.workflowObj;
        let relateEdges = [...workflowObj.edges];
        if (nodeId) {
            relateEdges = workflowObj.edges.filter(edge => nodeId === edge.props.src.split(':')[0]
            || nodeId === edge.props.to.split(':')[0]);
        }
        for (let index = 0; index < relateEdges.length; index++) {
            let edge = relateEdges[index];
            let edgeItem = {
                ...edge.props
            };
            // 刷新连线，需要保留原有的设置，同时删除连线的起止点信息
            delete edgeItem.start;
            delete edgeItem.end;
            delete edgeItem.config.triangle.start;
            delete edgeItem.config.triangle.end;
            delete edgeItem.config.backline.start;
            delete edgeItem.config.backline.end;
            delete edgeItem.config.line.start;
            delete edgeItem.config.line.end;
            this.aiflowIns.removeEdge(edgeItem, true);
            this.aiflowIns.addEdge(edgeItem, true);
        }
    }

    getGuideCircles(node, outputCircle, outputIndex) {
        this.workflowObj.nodes.forEach(programNode => {
            let inputCircles = programNode.dom.inputCircles;
            let inputCircleStyle = programNode.props.config.inputCircle;
            inputCircles && inputCircles.forEach((inputCircle, index) => {
                let inSameGroup = this.isSameGroup(inputCircle, outputCircle);
                if (!inSameGroup && this.isInputCircleAvailable(inputCircle)) {
                    // 检查类型是否一致
                    const outConf = node.props.output[outputIndex];
                    if (outConf.enableInputs) {
                        outConf.enableInputs.forEach(confIn => {
                            if (confIn.id === programNode.props.id && confIn.inputIndex === index) {
                                this.inputGuideCircles.push(inputCircle);
                                this.setElementStyle(inputCircle, inputCircleStyle.guide);
                            }
                        });
                    }
                    else {
                        this.inputGuideCircles.push(inputCircle);
                        this.setElementStyle(inputCircle, inputCircleStyle.guide);
                    }
                }
            });
        });
        return this.inputGuideCircles;
    }

    isSameGroup(inputCircle, outputCircle) {
        return inputCircle.parent.id === outputCircle.parent.id;
    }
    // 根据映射关系，确定该port是否为当前连线的可输入port
    isInputCircleAvailable(inputCircle) {
        if (this.relationMapping === 'm2m') {
            return true;
        }
        let busyInputCircles = this.workflowObj.edges.map(edge => {
            const [edgeNodeToId, inputIndex] = edge.props.to.split(':');
            let busyInputCircle;
            this.workflowObj.nodes.forEach(node => {
                if (node.props.id === edgeNodeToId && node.dom.inputCircles[inputIndex]) {
                    busyInputCircle = node.dom.inputCircles[inputIndex];
                }
            });
            return busyInputCircle;
        });
        return !busyInputCircles.includes(inputCircle);
    }

    // 验证重复线，如果重复则不画线
    checkEdge(edgeSrc, edgeDst) {
        let hasRepeat = this.workflowObj.edges.some(edge => edge.props.src === edgeSrc && edge.props.to === edgeDst);
        return hasRepeat;
    }

    // output target and src
    getEdgeSrcNode(e) {
        let srcStr = '';
        let outputCircle = null;
        let inputGuideCircles = [];
        let srcNode = null;
        this.workflowObj.nodes.some(node => {
            let nodeId = node.props.id;
            if (node.dom.outputCircles) {
                return node.dom.outputCircles.some((circle, outputIndex) => {
                    if (circle.contain(e.offsetX, e.offsetY)) {
                        srcStr = nodeId + ':' + outputIndex;
                        outputCircle = circle;
                        inputGuideCircles = this.getGuideCircles(node, circle, outputIndex);
                        srcNode = node;
                        return true;
                    }
                    return false;
                });
            }
            return false;
        });
        return {
            srcStr,
            outputCircle,
            inputGuideCircles,
            srcNode
        };
    }
    // 清楚所有的node和edge的选中态
    clearSelectedNodeAndEdge() {
        this.workflowObj.nodes.forEach(node => {
            const keys = Object.keys(node.dom);
            const config = node.props.config;
            keys.forEach(key => {
                if (key !== 'group' && key !== 'inputCircles' && key !== 'outputCircles') {
                    this.setElementStyle(node.dom[key], config[key].normal);
                }
            });
            node.selected = false;
        });
        this.workflowObj.edges.forEach(edge => {
            const keys = Object.keys(edge.dom);
            const config = edge.props.config;
            keys.forEach(key => {
                if (key !== 'group') {
                    this.setElementStyle(edge.dom[key], config[key].normal);
                }
            });
            edge.selected = false;
        });
    }
    setMulNodesStyle(mulGraphNodes) {
        mulGraphNodes.forEach(curNode => {
            curNode.selected = true;
            const keys = Object.keys(curNode.dom);
            const config = curNode.props.config;
            keys.forEach(key => {
                if (key !== 'group' && key !== 'inputCircles' && key !== 'outputCircles') {
                    this.setElementStyle(curNode.dom[key], config[key].selected);
                }
            });
        });
    }
    setNodeSelectedStyle(curNode) {
        this.clearSelectedNodeAndEdge();
        curNode.selected = true;
        const keys = Object.keys(curNode.dom);
        const config = curNode.props.config;
        keys.forEach(key => {
            if (key !== 'group' && key !== 'inputCircles' && key !== 'outputCircles') {
                this.setElementStyle(curNode.dom[key], config[key].selected);
            }
        });
    }
    setEdgeSelectedStyle(curEdge) {
        this.clearSelectedNodeAndEdge();
        const keys = Object.keys(curEdge.dom);
        const config = curEdge.props.config;
        keys.forEach(key => {
            if (key !== 'group') {
                this.setElementStyle(curEdge.dom[key], config[key].selected);
            }
        });
        curEdge.selected = true;
    }
    setNodeStyle(node, type) {
        const keys = Object.keys(node.dom);
        const config = node.props.config;
        keys.forEach(key => {
            if (key !== 'group' && key !== 'inputCircles' && key !== 'outputCircles') {
                this.setElementStyle(node.dom[key], config[key][type]);
            }
        });
    }
    setOutputCircleStyle(node, circle, type) {
        const config = node.props.config.outputCircle;
        this.setElementStyle(circle, config[type]);
    }
    setNodeEventStyle(node) {
        const {group, outputCircles} = node.dom;
        group.on('mouseover', () => {
            if (!node.selected) {
                this.setNodeStyle(node, 'hover');
            }
        });
        group.on('mouseout', () => {
            if (!node.selected) {
                this.setNodeStyle(node, 'normal');
            }
        });
        outputCircles && outputCircles.forEach(outCircle => {
            outCircle.on('mouseover', () => {
                this.setOutputCircleStyle(node, outCircle, 'hover');
            });
            outCircle.on('mouseout', () => {
                this.setOutputCircleStyle(node, outCircle, 'normal');
            });
        });
        group.on('click', e => {
            if (!this.aiflowIns.isMul) {
                this.aiflowIns.clearMulNodes();
            }
            this.aiflowIns.triggerCustomEvent('nodeSelected', node);
            this.setNodeSelectedStyle(node);
        });
    }
    setEdgeStyle(edge, type) {
        const keys = Object.keys(edge.dom);
        const config = edge.props.config;
        keys.forEach(key => {
            if (key !== 'group') {
                this.setElementStyle(edge.dom[key], config[key][type]);
            }
        });
    }
    setEdgeEventStyle(edge) {
        const group = edge.dom.group;
        group.on('mouseover', () => {
            if (!edge.selected) {
                this.setEdgeStyle(edge, 'hover');
            }
        });
        group.on('mouseout', () => {
            if (!edge.selected) {
                this.setEdgeStyle(edge, 'normal');
            }
        });
        group.on('click', () => {
            this.aiflowIns.triggerCustomEvent('edgeSelected', edge);
            this.setEdgeSelectedStyle(edge);
        });
    }
    setEventStyle() {
        this.workflowObj.nodes.forEach(node => {
            this.setNodeEventStyle(node);
        });
        this.workflowObj.edges.forEach(edge => {
            this.setEdgeEventStyle(edge);
        });
    }

    setElementStyle(zrElement, eleStyle) {
        if (!zrElement || !eleStyle) {
            return;
        }
        let {style, shape} = eleStyle;

        if (zrElement.type === 'bezier-curve') {
            zrElement.attr('style', style);
            return;
        }

        if (zrElement.type === 'text') {
            const {text, ...other} = eleStyle.style;
            style = other;
        }

        zrElement.attr({
            style,
            shape
        });
    }
}
