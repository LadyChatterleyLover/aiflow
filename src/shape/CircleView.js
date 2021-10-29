/**
 * @file Circle
 * @author zhousheng
 */

import Circle from 'zrender/lib/graphic/shape/Circle';

export default {
    type: 'Circle',
    props: {
        position: [0, 0],
        x: 0,
        y: 0,
        normal: {
            shape: {},
            style: {}
        }
    },
    render(ctx) {
        const c = new Circle(this.getRenderProps());
        // c.position = this.props.position;
        c.x = this.props.x || this.props.position[0];
        c.y = this.props.y || this.props.position[1];
        return c;
    }
};
