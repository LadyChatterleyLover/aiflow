/**
 * @file basic画法
 * @author zhousheng
 */
import Group from 'zrender/lib/container/Group';
import Node from '../Node';
import Edge from '../Edge';
import './NodeView';
import './EdgeView';
import * as utils from '../../utils';
import Shape from '../../shape/Shape';
import BezierCurveView from '../../shape/BezierCurveView';
import TriangleView from '../../shape/TriangleView';
import LineView from '../../shape/LineView';
import TextView from '../../shape/TextView';
import RectView from '../../shape/RectView';
import ImageView from '../../shape/ImageView';
import CircleView from '../../shape/CircleView';
import PolygonView from '../../shape/PolygonView';

Shape.extend(BezierCurveView);
Shape.extend(TriangleView);
Shape.extend(LineView);
Shape.extend(TextView);
Shape.extend(RectView);
Shape.extend(ImageView);
Shape.extend(CircleView);
Shape.extend(PolygonView);

/**
 * 默认模板
 */
export default {
    drawName: 'basic',
    props: {
        nodes: [],
        edges: []
    },
    $constructor() {
        this.nodes = [];
        this.edges = [];
    },
    render(zr, options) {
        this.nodes = [];
        this.edges = [];
        const g = new Group();
        // render nodes
        Array.isArray(this.props.nodes) && this.props.nodes.forEach(node => {
            let NodeClass = Node.getClazzByName('basicNode');
            const n = new NodeClass({
                props: node
            });
            this.nodes.push(n);
            g.add(n.render(options));
        });
        // render edges
        Array.isArray(this.props.edges) && this.props.edges.forEach(edge => {
            const linePoints = utils.calcuLinePoints(edge, this.nodes);
            const props = {
                ...linePoints,
                ...edge
            };
            let EdgeClass = Edge.getClazzByName('basicEdge');
            const e = new EdgeClass({props});
            this.edges.push(e);
            g.add(e.render(options));
        });
        return g;
    }
};
