/**
 * @file circle模版
 * @author zhousheng
 */
import {util} from 'zrender';
import defaultTemplate from './defaultTemplate';

let circleTemplate = {
};
util.merge(circleTemplate, defaultTemplate, {
    templateName: 'circleTemplate'
});
circleTemplate.node.box = {
    name: 'Circle',
    normal: {
        style: {
            stroke: '#ccc',
            fill: '#fff',
            lineWidth: 1
        },
        shape: {
            x: 0,
            y: 0,
            r: 50
        }
    },
    hover: {
        style: {
            stroke: '#3280FA',
            fill: 'rgba(16,103,238,0.05)',
            lineWidth: 1
        },
        shape: {
            x: 0,
            y: 0,
            r: 50
        }
    },
    selected: {
        style: {
            stroke: '#3280FA',
            fill: 'rgba(16,103,238,0.05)',
            lineWidth: 1
        },
        shape: {
            x: 0,
            y: 0,
            r: 50
        }
    }
};
circleTemplate.node.text.position = [0, 0];
export default circleTemplate;
