/**
 * @file rect
 * @author zhousheng
 */

import Rect from 'zrender/lib/graphic/shape/Rect';

export default {
    type: 'Rect',
    props: {
        normal: {
            shape: {},
            style: {}
        },
        hover: {
            shape: {},
            style: {}
        }
    },
    render() {
        const r = new Rect(this.getRenderProps());
        return r;
    }
};
