/**
 * @file Line
 * @author zhousheng
 */

import Line from 'zrender/lib/graphic/shape/Line';

export default {
    type: 'Line',
    props: {
        normal: {
            shape: {},
            style: {}
        }
    },
    init() {
        this.dom = this.render();
        if (!this.dom) {
            throw new Error('render() function needs return a zrender.Displayable instance');
        }
    },
    render(ctx) {
        const props = this.getRenderProps();
        props.shape.x1 = this.props.x1;
        props.shape.y1 = this.props.y1;
        props.shape.x2 = this.props.x2;
        props.shape.y2 = this.props.y2;
        const l = new Line(props);
        return l;
    }
};
