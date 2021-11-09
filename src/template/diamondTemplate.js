/**
 * @file 菱形模版
 * @author zhousheng
 */

import {util} from 'zrender';
import defaultTemplate from './defaultTemplate';

let diamondTemplate = {
};
util.merge(diamondTemplate, defaultTemplate, {
    templateName: 'diamondTemplate'
});
diamondTemplate.node.box.name = 'Polygon';
diamondTemplate.node.box.normal.shape = {
    // [top, right, bottom, left]
    points: [[50, 0], [100, 50], [50, 100], [0, 50]]
    // height: 100,
    // width: 170
};
diamondTemplate.node.text.position = [50, 50];

export default diamondTemplate;

