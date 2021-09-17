/**
 * @file Image
 * @author zhousheng
 */

import Image from 'zrender/lib/graphic/Image';
export default {
    type: 'Image',
    props: {
        normal: {
            shape: {},
            style: {}
        }
    },
    render() {
        const i = new Image(this.getRenderProps());
        return i;
    }
};
