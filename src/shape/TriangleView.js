/**
 * @file Triangle
 * @author zhousheng
 */

import Polygon from 'zrender/lib/graphic/shape/Polygon';
import {cacluTrianglePoints} from '../utils';

export default {
    type: 'Triangle',
    props: {
        normal: {
            shape: {},
            style: {}
        }
    },
    render() {
        const props = this.getRenderProps();
        const end = this.props.end;
        const width = props.shape.width;
        const height = props.shape.height;
        const points = cacluTrianglePoints(width, height, end, this.props.pointTo);
        props.shape.points = points;
        const p = new Polygon(props);
        return p;
    }
};
