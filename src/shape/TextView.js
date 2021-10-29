/**
 * @file Text
 * @author zhousheng
 */

import Text from 'zrender/lib/graphic/Text';

export default {
    type: 'Text',
    props: {
        normal: {
            shape: {},
            style: {}
        }
    },
    render() {
        const t = new Text(this.getRenderProps());
        // t.position = this.props.position;
        t.x = this.props.x  || this.props.position[0];
        t.y = this.props.y || this.props.position[1];
        return t;
    }
};
