/**
 * @file edge basic连线
 * @author zhousheng
 */

import Group from 'zrender/lib/container/Group';
import Shape from '../../shape/Shape';

/**
 * 连线
 */
export default {
    drawName: 'basicEdge',
    props: {},
    $constructor() {
        // zrender instances
        this.dom = {
            group: new Group()
        };
        this.children = {};
    },

    /**
     * 渲染箭头
     */
    renderTriangle() {
        const g = this.dom.group;
        if (this.props.config.triangle) {
            const shape = this.props.config.triangle;
            const ShapeClazz = Shape.getClazzByName(shape.name);
            const props = {
                start: this.props.start,
                end: this.props.end,
                pointTo: this.props.pointTo,
                ...shape
            };
            const s = new ShapeClazz({props});
            s.init();
            this.dom.triangle = s.dom;
            this.children.triangle = s;
            g.add(s.dom);
        }
    },

    /**
     * 渲染连线文字说明
     */
    renderText() {
        const g = this.dom.group;
        if (this.props.text && this.props.text.trim().length > 0) {
            // const shape = this.props.config.text;
            const ShapeClazz = Shape.getClazzByName('Text');
            const props = {
                normal: {
                    style: {
                        text: this.props.text,
                        textFill: '#2A2F44',
                        fontSize: 15
                    }
                },
                position: this.props.textPosition
            };
            const s = new ShapeClazz({props});
            s.init();
            this.dom.text = s.dom;
            this.children.text = s;
            g.add(s.dom);
        }
    },

    /**
     * 渲染整个连线图形
     *
     * @param {Object} options 渲染参数
     * @return {zrender.Group} zrender.Group实例
     */
    render(options) {
        const g = this.dom.group;
        if (g) {
            g.removeAll();
        }
        this.renderText();
        if (this.props.config && this.props.passPos) {
            let brokenLineGroup = new Group();
            let brokenLineBgGroup = new Group();
            this.renderTriangle();
            const style = this.props.config['line'];
            const bgStyle = this.props.config['backline'];
            const ShapeClazz = Shape.getClazzByName('Line');
            let {start, end, passPos, pointTo} = this.props;
            // 根据三角形修正连线的终点坐标
            const height = this.dom.triangle.shape.height;
            switch (pointTo) {
                case 'top':
                    end[1] = this.props.end[1] + height;
                    break;
                case 'right':
                    end[0] = this.props.end[0] - height;
                    break;
                case 'bottom':
                    end[1] = this.props.end[1] - height;
                    break;
                case 'left':
                    end[0] = this.props.end[0] + height;
                    break;
                default:
                    end[1] = this.props.end[1] + height;
                    break;
            }
            passPos.unshift(start);
            passPos.push(end);
            const len = passPos.length;
            passPos.forEach((points, index) => {
                // 线
                if (index < len - 1) {
                    let props = {
                        ...style,
                        x1: points[0],
                        y1: points[1],
                        x2: passPos[index + 1][0],
                        y2: passPos[index + 1][1]
                    };
                    let bgProps = {
                        ...bgStyle,
                        x1: points[0],
                        y1: points[1],
                        x2: passPos[index + 1][0],
                        y2: passPos[index + 1][1]
                    };
                    let lineTemp = new ShapeClazz({
                        props
                    });
                    lineTemp.init();
                    brokenLineGroup.add(lineTemp.dom);
                    let bgLineTemp = new ShapeClazz({
                        props: bgProps
                    });
                    bgLineTemp.init();
                    brokenLineBgGroup.add(bgLineTemp.dom);
                }
            });
            this.dom.line = brokenLineGroup;
            this.children.line = brokenLineGroup;
            g.add(brokenLineGroup);
            this.dom.backline = brokenLineBgGroup;
            this.children.backline = brokenLineBgGroup;
            g.add(brokenLineBgGroup);
        }
        else if (this.props.config) {
            this.renderTriangle();
            Object.keys(this.props.config).forEach(key => {
                const shape = this.props.config[key];
                if (shape.name !== 'Triangle') {
                    const ShapeClazz = Shape.getClazzByName(shape.name);
                    const props = {
                        start: Array.from(this.props.start),
                        end: Array.from(this.props.end),
                        pointTo: this.props.pointTo,
                        ...shape
                    };
                    // 根据三角形修正连线的终点坐标
                    const height = this.dom.triangle.shape.height;
                    switch (this.props.pointTo) {
                        case 'top':
                            props.end[1] = this.props.end[1] + height;
                            break;
                        case 'right':
                            props.end[0] = this.props.end[0] - height;
                            break;
                        case 'bottom':
                            props.end[1] = this.props.end[1] - height;
                            break;
                        case 'left':
                            props.end[0] = this.props.end[0] + height;
                            break;
                        default:
                            props.end[1] = this.props.end[1] + height;
                            break;
                    }
                    const s = new ShapeClazz({
                        props,
                        options
                    });
                    s.init();
                    this.dom[key] = s.dom;
                    this.children[key] = s;
                    g.add(s.dom);
                }
            });
        }
        return this.dom.group;
    }
};
