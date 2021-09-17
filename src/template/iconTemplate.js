/**
 * @file icon模版
 * @author zhousheng
 */
import zrender from 'zrender';
import defaultTemplate from './defaultTemplate';

let iconTemplate = {
};
zrender.util.merge(iconTemplate, defaultTemplate, {
    templateName: 'iconTemplate'
});
iconTemplate.node.icon = {
    name: 'Image',
    normal: {
        style: {
            image: '<@imgSrc>',
            x: 10,
            y: 6,
            width: 18,
            height: 18
        },
        origin: [19, 15]
    }
};
export default iconTemplate;

