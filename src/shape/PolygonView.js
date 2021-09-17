/**
 * @file polygon
 * @author zhousheng
 */

import Polygon from 'zrender/lib/graphic/shape/Polygon';

export default {
    type: 'Polygon',
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
        const r = new Polygon(this.getRenderProps());
        return r;
    }
};