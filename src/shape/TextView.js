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
        t.position = this.props.position;
        return t;
    }
};
