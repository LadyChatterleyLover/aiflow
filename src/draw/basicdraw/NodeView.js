/**
 * @file basic node 画法
 * @author zhousheng
 */

import {Group} from 'zrender';
import Shape from '../../shape/Shape';

/**
 * 节点
 */
export default {
    drawName: 'basicNode',
    props: {
        id: '',
        nodeName: '',
        position: [0, 0],
        input: [],
        output: [],
        config: {}
    },
    $constructor() {
        this.dom = {};
        this.dom.group = new Group();
        this.children = {};
    },

    getPointsFac(type, nodeType, placement) {
        const points = type === 'input' ? this.props.input : this.props.output;
        switch (nodeType) {
            case 'Circle':
                return this.getCirclePointsPosition(points, placement);
            case 'Polygon':
                return this.getPolygonPointsPosition(points, placement);
            case 'Rect':
                return this.getRecPointsPosition(points, placement);
            default:
                return this.getRecPointsPosition(points, placement);
        }
    },

    /**
     * 渲染输入点
     */
    renderInputCircle() {
        if (Array.isArray(this.props.input)) {
            const g = this.dom.group;
            const placement = this.props.config.inputCircle.circlePosition || 'top';
            let nodeType = this.props.config.box.name;
            const inputPoints = this.getPointsFac('input', nodeType, placement);
            this.props.input.forEach((input, index) => {
                const ShapeClazz = Shape.getClazzByName('Circle');
                const [x, y] = inputPoints[index];
                const props = {
                    ...this.props.config.inputCircle || {},
                    x,
                    y
                };
                const s = new ShapeClazz({
                    props
                });
                if (input.status === 'connected') {
                    s.setStatus('connected');
                }
                s.init();
                g.add(s.dom);
                if (Array.isArray(this.dom.inputCircles)) {
                    this.dom.inputCircles.push(s.dom);
                    this.children.inputCircles.push(s);
                }
                else {
                    this.dom.inputCircles = [s.dom];
                    this.children.inputCircles = [s];
                }
            });
        }
    },

    /**
     * 渲染输出点
     */
    renderOutputCircle() {
        if (Array.isArray(this.props.output)) {
            const g = this.dom.group;

            let nodeType = this.props.config.box.name;
            const placement = this.props.config.outputCircle.circlePosition || 'bottom';
            const outputPoints = this.getPointsFac('ouput', nodeType, placement);
            this.props.output.forEach((output, index) => {
                const ShapeClazz = Shape.getClazzByName('Circle');
                const [x, y] = outputPoints[index];
                let config = Object.assign({}, (this.props.config.outputCircle || {}));
                if (output.config) {
                    Object.assign(config, output.config);
                }
                const props = {
                    ...config,
                    x,
                    y
                };
                const s = new ShapeClazz({
                    props
                });
                s.init();
                g.add(s.dom);
                if (Array.isArray(this.dom.outputCircles)) {
                    this.dom.outputCircles.push(s.dom);
                    this.children.outputCircles.push(s);
                }
                else {
                    this.dom.outputCircles = [s.dom];
                    this.children.outputCircles = [s];
                }
            });
        }
    },

    /**
     * 渲染整个节点图形
     *
     * @param {Object} options 渲染参数，主要是AIFlow的全局配置
     * @return {zrender.Group} zrender.Group实例
     */
    render(options) {
        const g = this.dom.group;
        if (g) {
            g.removeAll();
        }
        g.z = this.props.z || 0;
        // g.position[0] = this.props.position[0];
        // g.position[1] = this.props.position[1];
        g.x = this.props.x || this.props.position[0];
        g.y = this.props.y || this.props.position[1];
        if (this.props.config) {
            // input，output需要根据box的坐标进行位置修正，所以单独渲染
            for (let key in this.props.config) {
                if (this.props.config.hasOwnProperty(key)) {
                    if (key !== 'inputCircle' && key !== 'outputCircle') {
                        const shape = this.props.config[key];
                        const ShapeClazz = Shape.getClazzByName(shape.name);
                        const s = new ShapeClazz({
                            props: shape,
                            options: options
                        });
                        s.init();
                        this.dom[key] = s.dom;
                        this.children[key] = s;
                        g.add(s.dom);
                    }
                }
            }
            this.renderInputCircle();
            this.renderOutputCircle();
        }
        return g;
    }
};
