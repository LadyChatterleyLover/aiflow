/**
 * @file Circle
 * @author zhousheng
 */

import Circle from 'zrender/lib/graphic/shape/Circle';

export default {
    type: 'Circle',
    props: {
        position: [0, 0],
        normal: {
            shape: {},
            style: {}
        }
    },
    render(ctx) {
        const c = new Circle(this.getRenderProps());
        c.position = this.props.position;
        return c;
    }
};
