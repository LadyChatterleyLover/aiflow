/**
 * @file aiflow
 * @author zhousheng
 */

import {matrix, init, util, Rect, registerPainter} from 'zrender';
import ComPlate from './comPlate';
import OptionsManager from './OptionsManager';
import Node from './draw/Node';
import Edge from './draw/Edge';
import Draw from './draw/Draw';
import basicDraw from './draw/basicdraw/DrawView';
import basicNode from './draw/basicdraw/NodeView';
import basicEdge from './draw/basicdraw/EdgeView';
import autoSort from './autoSort';
import autoSortWithMedian from './autoSortWithMedian';
import ZrEventManager from './event/ZrEventManager';
import Eventful from 'zrender/lib/core/Eventful';
import CanvasPainter from 'zrender/lib/canvas/Painter';
import * as utils from './utils';
import {isArray, clone as lodashClone} from 'lodash';

const comPlate = new ComPlate();

const MOUSE_EVENTS = ['mousedown', 'click', 'mouseover', 'mouseout', 'mouseup', 'mousemove', 'contextmenu'];
const CUSTOM_EVENTS = ['dragNode', 'dragNodeEnd', 'addEdge', 'removeEdge', 'addNode', 'removeNode', 'nodeSelected',
    'edgeSelected', 'copyNodes', 'pasteNodes', 'frameSelectInit', 'frameSelectEnd', 'pan', 'zoom', 'graphTransformed'
];

Draw.extend(basicDraw);
Node.extend(basicNode);
Edge.extend(basicEdge);

registerPainter('canvas', CanvasPainter);

/**
 * AIFlow
 */
export default class AIFlow {

    /**
     * AIFlow
     *
     * @constructor
     * @param {HTMLDomElement} dom 渲染容器
     * @param {Object} data 渲染数据
     * @param {Array} data.nodes 节点数据
     * @param {Array} data.edges 连线数据
     * @param {Object} globalConfig 配置项
     * @param {boolean=} globalConfig.isStatic 是否静态图片
     * @param {string} globalConfig.relationMapping 关系映射方式 目前支持一对多(o2m)、多对多(m2m)、暂不支持多对一(m2o)、一对一(o2o),默认值o2m
     * @param {number=} globalConfig.cWidth 画布宽度
     * @param {number=} globalConfig.cHeight 画布高度
     * @param {string=} globalConfig.templateName 整个图默认模版
     * @param {Object=} globalConfig.guideLine 辅助线相关配置
     * @param {boolean=} globalConfig.guideLine.on 是否开启辅助线
     * @param {style=} globalConfig.guideLine.style 辅助线样式
     * @param {Object=} globalConfig.autoSort 自动排序相关配置
     * @param {boolean=} globalConfig.autoSort.on 是否需要自动排序，true: 程序智能计算每个node的位置，false: 根据node position来定位
     * @param {boolean=} globalConfig.autoSort.horizontal 是否水平排序，true: 水平排序，false: 垂直排序
     * @param {align=} globalConfig.autoSort.align node对齐方式，start:水平排列时表示上对齐，垂直排列时表示左对齐 middle:中间对齐；end:水平排列时表示下对齐，垂直排列时表示右对齐
     * @param {number=} globalConfig.autoSort.beginX 起点X坐标
     * @param {number=} globalConfig.autoSort.beginY 起点Y坐标
     * @param {number=} globalConfig.autoSort.spaceX 横向间距，默认50
     * @param {number=} globalConfig.autoSort.spaceY 纵向间距，默认20
     * @param {string=} globalConfig.autoSort.type 排序算法选择，基础的排序算法(default)，中位数排序算法(withMedium)
     * @param {string=} globalConfig.autoSort.hryType 排序算法分层方法选择：基础分层方法（default）、重心法（barycenter），所有节点尽量往底层放
     * @param {Object=} globalConfig.frameSelect 框选参数
     * @param {Object=} globalConfig.frameSelect.style 样式
     * @param {Object=} globalConfig.zoom 鼠标滚动触发缩放事件相关配置
     * @param {boolean=} globalConfig.zoom.default 是否添加默认的缩放响应，即基于鼠标位置对整个图进行缩放
     * @param {number=} globalConfig.zoom.minScale 默认缩放响应的缩放下限
     * @param {number=} globalConfig.zoom.maxScale 默认缩放响应的缩放上限
     * @param {Object=} globalConfig.pan 鼠标拖动触发平移事件相关配置
     * @param {boolean=} globalConfig.pan.default 是否添加默认的平移响应，添加默认的pan事件，即在框选不打开和没有节点选中时，平移整个图
     * @param {boolean=} globalConfig.dragWithinCanvas 拖动节点时，检测并限制节点不移动到canvas外部
     */
    constructor(dom, data, globalConfig) {
        if (!dom || !util.isDom(dom)) {
            throw new TypeError('AIFlow needs a HTMLDomElement to render');
        }
        this.dom = dom;
        this.data = data;
        this.optionsManager = new OptionsManager(globalConfig);
        this._zr = init(dom, this.optionsManager.getZrOptions());
        this.workflowObj = {};
        this.drawGroup = null;
        this.maxCoord = {
            x: 0,
            y: 0
        };
        // 多选的节点
        this.mulNodes = [];
        this.render();
        this.zrEventMan = new ZrEventManager(this);
        Eventful.call(this);
        this.event = {};
        this._resolveZoomAndPan();
    }

    _resolveZoomAndPan() {
        if (this.optionsManager.options.pan.default) {
            let frameSelect = false;
            this.on('frameSelectInit', () => {
                frameSelect = true;
            });
            this.on('frameSelectEnd', () => {
                frameSelect = false;
            });
            this.on('pan', e => {
                const {moveNode, moveNodes} = this.zrEventMan;
                if (e.target || moveNode || moveNodes.length > 0 || frameSelect) {
                    return;
                }
                this.drift(e.deltaX, e.deltaY);
            });
        }
        if (this.optionsManager.options.zoom.default) {
            this.on('zoom', e => {
                e.event.preventDefault();
                const wheelDelta = e.wheelDelta;
                const x = e.event.zrX;
                const y = e.event.zrY;
                this.scale(Math.pow(10, wheelDelta), [x, y], true);
            });
        }
    }

    getGraphRect() {
        const drawGroup = this.drawGroup;
        // const localTransform = drawGroup.get
        drawGroup.updateTransform();
        const rect = lodashClone(drawGroup.getBoundingRect());
        const transform = drawGroup.transform;
        // const tempRect = rect;
        if (transform) {
            rect.applyTransform(transform);
            // BoundingRect.applyTransform(tempRect, rect, transform);
        }
        return rect;
    }

    /**
     * 注册模版
     *
     * @param {string} templateName 模版名称
     * @param {Object} templateObj 模版对象
     * @return {undefined}
     */
    static registerTemplate(...args) {
        comPlate.registerTemplate.call(comPlate, ...args);
    }

    setIsStatic(isStatic) {
        this.zrEventMan.setIsStatic(isStatic);
    }
    getIsStatic() {
        return this.zrEventMan.isStatic;
    }
    setWorkflowObj(draw) {
        this.workflowObj.nodes = draw.nodes;
        this.workflowObj.edges = draw.edges;
    }
    getNodesIns() {
        return this.workflowObj.nodes;
    }
    getNodeInsById(id) {
        return this.workflowObj.nodes.find(node => node.props.id === id);
    }
    getEdgesIns() {
        return this.workflowObj.edges;
    }
    getEdgeInsById(src, to) {
        return this.workflowObj.edges.filter(edge => {
            const srcId = edge.props.src.split(':')[0];
            const toId = edge.props.to.split(':')[0];
            return src === srcId && to === toId;
        });
    }
    getEdgeInsByTo(to) {
        return this.workflowObj.edges.filter(edge => to === edge.props.to.split(':')[0]);
    }
    getEdgeInsBySrc(src) {
        return this.workflowObj.edges.filter(edge => src === edge.props.src.split(':')[0]);
    }

    getMaxCoord() {
        return this.maxCoord;
    }
    autoSort(autoSortOption) {
        this.optionsManager.options.autoSort.on = true;
        this.optionsManager.options.autoSort.type = autoSortOption.type;
        util.extend(this.optionsManager.options.autoSort, autoSortOption);
        this._zr.remove(this.drawGroup);
        this.drawGroup = null;
        this.workflowObj.nodes.length = 0;
        this.workflowObj.edges.length = 0;
        this.render();
        this.zrEventMan.setEventStyle();
    }
    dispose() {
        // this._zr.remove(this.drawGroup);
        this._zr.dispose();
        // this.drawGroup = null;
    }

    resize(width, height) {
        Object.assign(this.optionsManager.options, {
            cWidth: width,
            cHeight: height
        });
        const workflow = this.workflowObj;
        if (this.optionsManager.options.autoSort.on) {
            const {
                type = 'default'
            } = this.optionsManager.options.autoSort;
            if (type === 'withMedium') {
                workflow.nodes = autoSortWithMedian(Object.assign({
                    nodes: workflow.nodes,
                    edges: workflow.edges,
                    cWidth: this.optionsManager.options.cWidth,
                    cHeight: this.optionsManager.options.cHeight
                }, this.optionsManager.options.autoSort));
            }
            else {
                workflow.nodes = autoSort(Object.assign({
                    nodes: workflow.nodes,
                    edges: workflow.edges
                }, this.optionsManager.options.autoSort));
            }

            let xArr = [];
            let yArr = [];
            workflow.nodes.forEach(node => {
                xArr.push(node.x);
                yArr.push(node.y);
                const dataNode = this.data.nodes.find(dataNode => node.id === dataNode.id);
                dataNode.x = node.x;
                dataNode.y = node.y;
            });
            this.maxCoord.x = Math.max(...xArr);
            this.maxCoord.y = Math.max(...yArr);
        }
        this._zr.resize({width, height});
        this.zrEventMan.setEventStyle();
    }

    render() {
        const {nodes, edges} = this.data;
        // 编译
        let templateData = comPlate.compileTemplate(nodes, edges, this.optionsManager.options);
        if (this.optionsManager.options.autoSort.on) {
            const {
                type = 'default'
            } = this.optionsManager.options.autoSort;
            if (type === 'withMedium') {
                templateData.nodes = autoSortWithMedian(Object.assign({
                    nodes: templateData.nodes,
                    edges: templateData.edges,
                    cWidth: this.optionsManager.options.cWidth,
                    cHeight: this.optionsManager.options.cHeight
                }, this.optionsManager.options.autoSort));
            }
            else {
                templateData.nodes = autoSort(Object.assign({
                    nodes: templateData.nodes,
                    edges: templateData.edges
                }, this.optionsManager.options.autoSort));
            }

            let xArr = [];
            let yArr = [];
            templateData.nodes.forEach(node => {
                xArr.push(node.x);
                yArr.push(node.y);
                const dataNode = this.data.nodes.find(dataNode => node.id === dataNode.id);
                dataNode.x = node.x;
                dataNode.y = node.y;
            });
            this.maxCoord.x = Math.max(...xArr);
            this.maxCoord.y = Math.max(...yArr);
        }
        const DrawClazz = Draw.getClazzByName('basic');
        const draw = new DrawClazz({
            props: templateData
        });
        this.drawGroup = draw.render(this._zr, this.optionsManager.options);
        this._zr.add(this.drawGroup);
        this.setWorkflowObj(draw);
    }

    /**
     * 获取指定名称的模版对象
     *
     * @param {string} templateName 模版名称
     * @return {Object} compileObj 编译后的对象
     */
    getTemplate(templateName) {
        return comPlate.getTemplate.call(comPlate, templateName);
    }

    /**
     * 更新指定名称的模版对象
     *
     * @param {string} templateName 模版名称
     * @param {Object} templateUpdateObj 模版对象
     * @return {undefined}
     */
    updateTemplate(templateName, templateUpdateObj) {
        comPlate.updateTemplate.call(comPlate, templateName, templateUpdateObj);
    }

    /**
     * 添加节点
     *
     * @param {Object} node 节点信息
     * @param {string} node.id 节点id
     * @param {boolean=} preventCusEvent 是否阻止触发添加节点event(addNode), false触发，true不触发
     * @return {zrender.Displayable} node节点
     */
    addNode(node, preventCusEvent, config = {}) {
        if (this.findNodeIndex(node.id) > -1) {
            throw new Error(`Node with id(${node.id}) is exist`);
        }
        else {
            const {globalPosition} = config;
            const options = this.optionsManager.options;
            const templateData = comPlate.compileTemplate([node], [], options);

            let NodeClass = Node.getClazzByName('basicNode');
            const n = new NodeClass({
                props: templateData.nodes[0]
            });
            const zrNode = n.render(this.optionsManager.options);
            if (globalPosition) {
                const drawGroup = this.drawGroup;
                drawGroup.updateTransform();
                const m = matrix.create();
                m[4] = globalPosition[0];
                m[5] = globalPosition[1];
                const parentTransform = drawGroup.transform || matrix.create();
                const parentInvTransform  = matrix.create();
                drawGroup.transform && matrix.invert(parentInvTransform, parentTransform);
                // zrNode.position = [0, 0];
                zrNode.x = 0;
                zrNode.y = 0;
                const localTransform = zrNode.getLocalTransform();
                const localInvTransform = matrix.create();
                matrix.invert(localInvTransform, localTransform);
                m[0] = m[3] = parentTransform[0] * localTransform[0];
                matrix.mul(m, parentInvTransform, m);
                matrix.mul(m, m, localInvTransform);
                // zrNode.position = [m[4], m[5]];
                zrNode.x = m[4];
                zrNode.y = m[5];
                // node.position = [m[4], m[5]];
                node.x = m[4];
                node.y = m[5];
            }
            this.drawGroup.add(zrNode);
            this.workflowObj.nodes.push(n);
            this.data.nodes.push(node);
            this.zrEventMan.setNodeEventStyle(n);
            preventCusEvent || this.triggerCustomEvent('addNode', {target: n});
            return n;
        }
    }

    /**
     * 设置拖动group
     *
     * @param {Object} dragNode node
     * @param {event} e 事件源
     */
    setDragNode(dragNode, e) {
        this.zrEventMan.setDragNode(dragNode, e);
    }

    drift(deltaX, deltaY) {
        const m = matrix.clone(this.drawGroup.getLocalTransform());
        m[4] += deltaX;
        m[5] += deltaY;
        this._setTransform(m);
    }

    scale(scale, origin = [0, 0], clip = false) {
        // 限制scale在MIN_SCALE和MAX_SCALE之间
        if (clip) {
            const curScale = this.getScaleX();
            const {minScale, maxScale} = this.optionsManager.options.zoom;
            if (scale * curScale > maxScale) {
                scale = maxScale / curScale;
            }
            if (scale * curScale < minScale) {
                scale = minScale / curScale;
            }
        }

        if (origin === 'center') {
            // const drawGroup = this.drawGroup;
            // // const localTransform = drawGroup.get
            // drawGroup.updateTransform();
            // const rect = _.clone(drawGroup.getBoundingRect());
            // const transform = drawGroup.transform;
            // // const tempRect = rect;
            // if (transform) {
            //     rect.applyTransform(transform);
            //     // BoundingRect.applyTransform(tempRect, rect, transform);
            // }
            const rect = this.getGraphRect();
            origin = [
                (rect.x + rect.width) / 2,
                (rect.y + rect.height) / 2
            ];
        }

        const m = matrix.clone(this.drawGroup.getLocalTransform());
        const [ox, oy] = origin;
        const sx = scale;
        const sy = scale;
        m[4] -= ox;
        m[5] -= oy;
        m[0] *= sx;
        m[1] *= sy;
        m[2] *= sx;
        m[3] *= sy;
        m[4] *= sx;
        m[5] *= sy;
        m[4] += ox;
        m[5] += oy;
        this._setTransform(m);
    }

    resetTransform(m) {
        this._setTransform(m || matrix.create());
    }

    _setTransform(m) {
        this.drawGroup.setLocalTransform(m);
        this.drawGroup.dirty();
        this.triggerCustomEvent('graphTransformed', {transform: m});
    }

    /**
     * 删除节点
     *
     * @param {Object} node 节点信息
     * @param {string} node.id 节点id
     * @param {boolean=} preventCusEvent 是否阻止触发删除节点event(removeNode), false触发，true不触发
     */
    removeNode(node, preventCusEvent, onlyRemoveNode) {
        // find node and delete NodeView instance
        const findNodeIndex = this.findNodeIndex(node.id);
        let nodeToDelete;
        if (findNodeIndex > -1) {
            nodeToDelete = this.workflowObj.nodes[findNodeIndex];
            this.workflowObj.nodes.splice(findNodeIndex, 1);
            this.removeEl(nodeToDelete.dom.group);
        }

        // delete from this.data
        this.data.nodes = this.data.nodes.filter(n => n.id !== node.id);
        // delete edges related to the node
        if (!onlyRemoveNode) {
            this.updateEdgeByNode(node.id);
        }
        preventCusEvent || this.triggerCustomEvent('removeNode', {target: nodeToDelete});
    }

    /**
     * 复制节点
     *
     * @param {Object | Array} nodes 复制的节点，可以是单个，也可以是数组
     * @return {undefined}
     */
    copyNodes(nodes) {
        this.cacheCopyNodes = Array.isArray(nodes) ? nodes : [nodes];
        this.triggerCustomEvent('copyNodes', {target: this.cacheCopyNodes});
    }

    /**
     * 黏贴节点
     *
     * @return {undefined}
     */
    pasteNodes() {
        this.triggerCustomEvent('pasteNodes', {target: this.cacheCopyNodes});
    }

    /**
     * 初始化多选节点
     *
     * @param {Object | Array} nodes 多选节点，可以是单个，也可以是数组
     * @return {undefined}
     */
    initMulNodes(nodes) {
        this.mulNodes = [];
        this.addMulNodes(nodes);
    }

    /**
     * 添加多选节点
     *
     * @param {Object | Array} nodes 多选节点，可以是单个，也可以是数组
     * @return {undefined}
     */
    addMulNodes(nodes) {
        Array.isArray(nodes) ? this.mulNodes.push(...nodes) : this.mulNodes.push(nodes);
        const mulGraphNodes = this.getGraphMulNodes();
        this.zrEventMan.setMulNodesStyle(mulGraphNodes);
    }

    /**
     * 清空多选节点
     *
     * @return {undefined}
     */
    clearMulNodes() {
        this.mulNodes = [];
        this.zrEventMan.clearSelectedNodeAndEdge();
    }

    /**
     * 获取多选节点
     *
     * @return {Array} 已有多选节点
     */
    getMulNodes() {
        return this.mulNodes;
    }

    getGraphMulNodes() {
        const mulGraphNodes = this.workflowObj.nodes.filter(node =>
            this.mulNodes.find(mNode => mNode.id === node.props.id));
        return mulGraphNodes;
    }

    selectAllNodes() {
        this.workflowObj.nodes.forEach(node => {
            this.addMulNodes(node.props);
        });
    }

    getFrameSelectNodes() {
        this.clearMulNodes();
        if (!this.frameSelectIns) {
            return;
        }
        const frameSelectInsClone = new Rect(
            {
                shape: {...this.frameSelectIns.shape},
                style: {...this.frameSelectIns.style},
                z: 100000
            }
        );
        let m = [];
        matrix.invert(m, this.drawGroup.getLocalTransform());
        frameSelectInsClone.setLocalTransform(m);
        frameSelectInsClone.updateTransform();
        this.workflowObj.nodes.forEach(node => {
            const group = node.dom.group;
            const rect = group.getBoundingRect();
            rect.applyTransform(group.getLocalTransform());
            const {x, y, width, height} = rect;
            if (frameSelectInsClone.contain(x, y)
                && frameSelectInsClone.contain(x, y + height)
                && frameSelectInsClone.contain(x + width, y)
                && frameSelectInsClone.contain(x + width, y + height)) {
                this.addMulNodes(node.props);
            }
        });
    }
    frameSelectMousedown(e) {
        const {zrX, zrY} = e.event;
        this.frameSelectX = zrX;
        this.frameSelectY = zrY;
        this.frameSelectStart = true;
    }
    frameSelectMousemove(e) {
        if (!this.frameSelectStart) {
            return;
        }
        this.frameSelectIns && this._zr.remove(this.frameSelectIns);
        const {zrX, zrY} = e.event;
        this.frameSelectIns = new Rect({
            shape: {
                x: this.frameSelectX,
                y: this.frameSelectY,
                width: zrX - this.frameSelectX,
                height: zrY - this.frameSelectY
            },
            style: this.optionsManager.options.frameSelect.style,
            z: 100000
        });
        this._zr.add(this.frameSelectIns);
    }
    frameSelectMouseup(e) {
        this.getFrameSelectNodes();
        this.frameSelectEnd();
    }
    frameSelectInit() {
        this.setIsStatic(true);
        // 需要绑定同一个function，bind以后是新的function
        const frameSelectMousedown = this.frameSelectMousedown.bind(this);
        const frameSelectMousemove = this.frameSelectMousemove.bind(this);
        const frameSelectMouseup = this.frameSelectMouseup.bind(this);
        this.event = {
            frameSelectMousedown,
            frameSelectMousemove,
            frameSelectMouseup
        };
        this._zr.on('mousedown', frameSelectMousedown);
        this._zr.on('mousemove', frameSelectMousemove);
        this._zr.on('mouseup', frameSelectMouseup);
        this.triggerCustomEvent('frameSelectInit');
    }
    frameSelectEnd() {
        this.setIsStatic(false);
        this.frameSelectStart = false;
        // 需要绑定同一个function，bind以后是新的function
        this.frameSelectIns && this._zr.remove(this.frameSelectIns);
        const {
            frameSelectMousedown,
            frameSelectMousemove,
            frameSelectMouseup
        } = this.event;
        this._zr.off('mousedown', frameSelectMousedown);
        this._zr.off('mousemove', frameSelectMousemove);
        this._zr.off('mouseup', frameSelectMouseup);
        this.triggerCustomEvent('frameSelectEnd');
    }

    /**
     * 添加连线
     *
     * @param {Object} edge 节点信息
     * @param {string} edge.src 输入点
     * @param {string} edge.to 输出点
     * @param {boolean=} preventCusEvent 是否阻止触发添加连线event(addEdge), false触发，true不触发
     */
    addEdge(edge, preventCusEvent) {
        const options = this.optionsManager.options;
        const templateData = comPlate.compileTemplate([], [edge], options);
        const e = templateData.edges[0];
        const linePoints = utils.calcuLinePoints(e, this.workflowObj.nodes);

        if (!linePoints) {
            return;
        }

        const props = {
            ...linePoints,
            ...e
        };

        let EdgeClass = Edge.getClazzByName('basicEdge');
        const eIns = new EdgeClass({props});
        this.drawGroup.add(eIns.render(this.optionsManager.options));
        this.workflowObj.edges.push(eIns);
        this.zrEventMan.setEdgeEventStyle(eIns);
        // add edge to this.data
        this.data.edges.push(edge);
        // no need to trigger addEdge event when node is dragging to move which make edge re-create.
        preventCusEvent || this.triggerCustomEvent('addEdge', {target: eIns});
    }

    /**
     * 删除连线
     *
     * @param {Object} edge 连线信息
     * @param {string} edge.src 输入点
     * @param {string} edge.to 输出点
     * @param {boolean=} preventCusEvent 是否阻止触发删除连线event(removeEdge), false触发，true不触发
     */
    removeEdge(edge, preventCusEvent) {
        // find edge
        const findedgeIndex = this.workflowObj.edges.findIndex(e =>
            e.props.src === edge.src && e.props.to === edge.to);
        let edgeToDelete;
        if (findedgeIndex > -1) {
            edgeToDelete = this.workflowObj.edges[findedgeIndex];
            this.workflowObj.edges.splice(findedgeIndex, 1);
            this.removeEl(edgeToDelete.dom.group);
        }
        // delete from this.data
        this.data.edges = this.data.edges.filter(e => !(e.src === edge.src && e.to === edge.to));
        preventCusEvent || this.triggerCustomEvent('removeEdge', {target: edgeToDelete});
    }

    setIsMul(isMul) {
        this.isMul = isMul;
    }

    /**
     * 删除元素
     *
     * @param {zrender.Displayable} el AIFlow中保存的zrender图形实例
     */
    removeEl(el) {
        this.drawGroup.remove(el);
    }

    /**
     * 缩放
     *
     * @param {Array<number>} scale 缩放比例[scalex, scaley]
     * @param {Array<number>} center 缩放参考原点[x, y]
     */
    setScale(scale, center) {
        if (this._zr && this.drawGroup) {
            // this.resetTransform();
            const curScale = this.getScaleX();
            this.scale(scale / curScale, center);
        }
    }

    getScale() {
        if (this._zr && this.drawGroup) {
            return this.drawGroup.scale;
        }
        return [1, 1];
    }

    getScaleX() {
        return this.getScale()[0];
    }

    /**
     * 根据节点id查询节点在nodes中的index
     *
     * @param {string} id 节点id
     * @return {number} 查找到的节目下标，没有查到则为-1
     */
    findNodeIndex(id) {
        return this.workflowObj.nodes.findIndex(n => n.props.id === id);
    }

    /**
     * 查询连线在edges中的index
     *
     * @param {string} src 连线起始点信息
     * @param {string} to 连线终点信息
     * @return {number} 查找到的连线对象下标，没有查到则为-1
     */
    findEdgeIndex(src, to) {
        return this.workflowObj.edges.findIndex(e => e.props.src === src && e.props.to === to);
    }

    /**
     * 根据ID更新对应的节点
     *
     * @param {string} id 节点id
     * @param {string|Object} selector 如果是string，则是节点的子形状；如果是Object，则直接对节点更新
     * @param {Object=} attributes 如果selector是string，则为待更新的属性,属性参考对应形状的zrender实例
     */
    updateNode(id, selector, attributes) {
        const index = this.findNodeIndex(id);
        if (index === -1) {
            return;
        }
        const nodeToUpdate = this.workflowObj.nodes[index];
        if (util.isObject(selector) && !attributes) {
            // 如果更新了node的位置，需要更新连线
            nodeToUpdate.dom.group.attr(selector);
            if (selector.x
                && selector.y
                && (selector.x !== nodeToUpdate.props.x || selector.y !== nodeToUpdate.props.y)) {
                nodeToUpdate.props.x = selector.x;
                nodeToUpdate.props.y = selector.y;
                this.updateEdgeByNode(id);
            }
            // 修改shape
            // 修改点的位置
        }
        else if (util.isString(selector) && util.isObject(attributes)) {
            if (nodeToUpdate.children[selector]) {
                // 更新对应形状的props
                const currStatus = nodeToUpdate.children[selector].status;
                const currProps = nodeToUpdate.children[selector].props[currStatus];
                util.merge(currProps, attributes, true);
                // 更新Node的props
                nodeToUpdate.props.config[selector] = util.merge({}, nodeToUpdate.children[selector].props, true);
                // 如果没有更新shape属性，就直接使用zrender实例的方法设置属性
                if (!attributes.shape) {
                    nodeToUpdate.children[selector].dom.attr(attributes);
                }
                else {
                    // 根据最新的属性重新绘制node
                    this.removeNode(nodeToUpdate.props, true);
                    this.addNode(nodeToUpdate.props, true);
                    // 更新相关的连线
                    this.updateEdgeByNode(id);
                }
            }
            else {
                throw new Error(`There is no shape with name(${selector}) in node(id:${id})`);
            }
        }
        else {
            throw new Error('invalid params');
        }
    }

    updateNodeZ(id, z) {
        const index = this.findNodeIndex(id);
        if (index === -1) {
            return;
        }
        const nodeToUpdate = this.workflowObj.nodes[index];
        // for(let selector in )
        // nodeToUpdate.children
        Object.keys(nodeToUpdate.children).forEach(selector => {
            let selectedChildren = nodeToUpdate.children[selector];
            if (!isArray(selectedChildren)) {
                selectedChildren = [selectedChildren];
            }
            selectedChildren.forEach(child => {
                child.props.normal.z = z;
                child.dom.attr({z});
            });
            let configName = selector;
            if (selector === 'outputCircles') {
                configName = 'outputCircle';
            }
            if (selector === 'inputCircles') {
                configName = 'inputCircle';
            }
            util.merge(nodeToUpdate.props.config[configName].normal, {z}, true);
        });
    }

    /**
     * 更新连线
     *
     * @param {Object} edge 连线信息
     * @param {string} edge.src 起点信息
     * @param {string} edge.to 终点信息
     * @param {string} selector 节点的子形状
     * @param {Object} attributes 待更新的属性,属性参考对应形状的zrender实例,暂不支持根据本地Shape的props更新
     */
    updateEdge(edge, selector, attributes) {
        if (!edge || !edge.src || !edge.to || !util.isString(selector) || !util.isObject(attributes)) {
            throw new Error('invalid params when invoking updateEdge()');
        }
        const index = this.findEdgeIndex(edge.src, edge.to);
        if (index === -1) {
            throw new Error(`There is no Edge with src(${edge.src}) and to(${edge.to})`);
        }
        const edgeToUpdate = this.workflowObj.edges[index];
        const shapeToUpdate = edgeToUpdate.children[selector];
        if (shapeToUpdate) {
            const status = shapeToUpdate.status;
            const props = shapeToUpdate.props[status];
            const prevShapeWidth = props.shape.width;
            const prevShapeHeight = props.shape.height;
            util.merge(props, attributes, true);
            edgeToUpdate.props.config[selector] = util.merge({}, shapeToUpdate.props, true);
            if (selector === 'triangle') {
                if (attributes.shape) {
                    if (Number(attributes.shape.width) !== prevShapeWidth
                        || Number(attributes.shape.height) !== prevShapeHeight) {
                        // 如果箭头的宽高或者指向有变化，需要重新修改顶点坐标
                        const renderProps = shapeToUpdate.getRenderProps();
                        const end = shapeToUpdate.props.end;
                        const width = renderProps.shape.width;
                        const height = renderProps.shape.height;
                        const points = utils.cacluTrianglePoints(width, height, end, shapeToUpdate.props.pointTo);
                        renderProps.shape.points = points;
                        shapeToUpdate.dom.attr(renderProps);
                    }
                    // 如果shape有调整，则重新画线
                    this.removeEdge(edgeToUpdate.props, true);
                    this.addEdge(edgeToUpdate.props, true);
                }
                else {
                    shapeToUpdate.dom.attr(attributes);
                }
            }
            else {
                shapeToUpdate.dom.attr(attributes);
            }
        }
    }

    updateEdgeZ(edge, z) {
        const index = this.findEdgeIndex(edge.src, edge.to);
        if (index === -1) {
            return;
        }
        const edgeToUpdate = this.workflowObj.edges[index];
        Object.keys(edgeToUpdate.children).forEach(selector => {
            let selectedChildren = edgeToUpdate.children[selector];
            if (!isArray(selectedChildren)) {
                selectedChildren = [selectedChildren];
            }
            selectedChildren.forEach(child => {
                child.props.z = z;
                child.dom.attr({z});
            });
            util.merge(edgeToUpdate.props.config[selector].normal, {z}, true);
        });
    }

    /**
     * 刷新节点相关的连线
     *
     * @param {string} nodeId 更新过的节点id
     */
    updateEdgeByNode(nodeId) {
        const edges = this.workflowObj.edges.filter(e =>
            e.props.src.split(':')[0] === nodeId || e.props.to.split(':')[0] === nodeId);
        edges.forEach(e => {
            let edgeItem = {
                ...e.props
            };
            // 刷新连线，需要保留原有的设置，同时删除连线的起止点信息
            delete edgeItem.start;
            delete edgeItem.end;
            delete edgeItem.config.triangle.start;
            delete edgeItem.config.triangle.end;
            this.removeEdge(edgeItem, true);
            this.addEdge(edgeItem, true);
        });
    }

    /**
     * 更新node的输入或输出
     *
     * @param {string} nodeId nodeId
     * @param {Array} inputArr 可输入port信息
     * @param {number=} index output index
     */
    updateNodeOutputEnableInputs(nodeId, inputArr, index) {
        const node = this.workflowObj.nodes.find(node => node.props.id === nodeId);
        node.props.output[index].enableInputs = inputArr;
    }

    formatMouseEventParams(e) {
        const target = e.target;
        if (!target) {
            return {
                e,
                target: null,
                dom: null,
                isNode: false,
                isEdge: false,
                props: null
            };
        }
        const {nodes, edges} = this.workflowObj;
        let dom = null;
        let props = null;
        const isNode = nodes.some(node => {
            const domKeys = Object.keys(node.dom);
            return domKeys.some(domKey => {
                if (domKey === 'inputCircles' || domKey === 'outputCircles') {
                    const circles = node.dom[domKey];
                    if (circles.find(circle => circle === target)) {
                        dom = node.dom;
                        props = node.props;
                        return true;
                    }
                }
                if (node.dom[domKey] === target) {
                    dom = node.dom;
                    props = node.props;
                    return true;
                }
                return false;
            });
        });
        let isEdge = false;
        if (!isNode) {
            isEdge = edges.some(edge => {
                const domKeys = Object.keys(edge.dom);
                return domKeys.some(domKey => {
                    if (edge.dom[domKey] === target) {
                        dom = edge.dom;
                        props = edge.props;
                        return true;
                    }
                    return false;
                });
            });
        }
        return {
            e,
            target,
            dom,
            isNode,
            isEdge,
            props
        };
    }

    /**
     * 触发绑定的自定义事件
     *
     * @param {string} type 自定义事件类型
     * @param {Object} e 事件对象
     */
    triggerCustomEvent(type, e) {
        const eventPack = [];
        if (MOUSE_EVENTS.indexOf(type) > -1) {
            eventPack.push(this.formatMouseEventParams(e), this);
        }
        else if (CUSTOM_EVENTS.indexOf(type) > -1) {
            eventPack.push(e, this);
        }
        else {
            console.warn(`No such custom event "${type}" in lib`);
            return;
        }
        !this.isSilent(type) && this.trigger.apply(this, [type, ...eventPack]);
    }
}

util.mixin(AIFlow, Eventful);
