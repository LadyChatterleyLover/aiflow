import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {Dropdown, Menu} from 'antd';

import AIFlow from '../../src';

import 'antd/es/locale/zh_CN';

import './dag.less';

// 全局配置
const GLOBAL_CONFIG = {
    cWidth: 800,
    cHeight: 600,
    // 是否静态图片，true：节点和连线都不可拖动，false：可以添加事件监听
    isStatic: false,
    // 开启辅助线
    guideLineOn: true,
    // 临时线的样式
    templineStyle: {
        stroke: '#f90',
        lineWidth: 2
    },
    pan: {
        default: true
    },
    zoom: {
        default: true
    },
    dragWithinCanvas: false
};

const moduleData = [
    {id: 1, name: '数据集'},
    {id: 2, name: '数据拆分'},
    {id: 3, name: '列选择'}
];
const node1 = {
    id: '100',
    defineData: {
        nodeName: '数据拆分'
    },
    // 画布中位置
    position: [100, 100],
    // 输入
    input: [
        {}
    ],
    // 输出
    output: [
        {}
    ]
};
const node2 = {
    id: '101',
    defineData: {
        nodeName: '随机采样'
    },
    // 画布中位置
    position: [300, 100],
    // 输入
    input: [
        {}
    ],
    // 输出
    output: [
        {}
    ]
};
const node3 = {
    // id
    id: '102',
    defineData: {
        nodeName: 'asdfsdf'
    },
    // 画布中位置
    position: [100, 300],
    // 输入
    input: [
        {}
    ],
    // 输出
    output: [
        {}
    ]
};
const nodes = [
    node1,
    node2,
    node3
];
const edges = [
    {
        src: '100:0',
        to: '101:0'
    },
    {
        src: '100:0',
        to: '102:0'
    }
];

export default props => {
    const [showNodeMenu, setShowNodeMenu] = useState(false);
    const [showEdgeMenu, setShowEdgeMenu] = useState(false);
    const [curNode, setCurNode] = useState(null);
    const [curEdge, setCurEdge] = useState(null);
    const [nodeMenuPos, setNodeMenuPos] = useState({left: 0, top: 0});
    const [edgeMenuPos, setEdgeMenuPos] = useState({left: 0, top: 0});

    const newModuleId = useRef('');
    const aiflowRef = useRef(null);
    const aiflowIns = useRef(null);
    const nodeMenuRef = useRef(null);
    const edgeMenuRef = useRef(null);

    const handleModuleMouseDown = useCallback(id => {
        newModuleId.current = id;
    }, []);
    const handleNodeMenu = useCallback(key => {
        if (key === 'delete') {
            aiflowIns.current.removeNode(curNode);
        }
        setShowNodeMenu(false);
    }, [curNode]);
    const handleEdgeMenu = useCallback(key => {
        if (key === 'delete') {
            aiflowIns.current.removeEdge(curEdge);
        }
        setShowEdgeMenu(false);
    }, [curEdge]);
    const nodeMenu = useMemo(() => (
        <Menu className="graph-tab-menu" onClick={({key}) => handleNodeMenu(key)}>
            <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
    ), [handleNodeMenu]);
    const edgeMenu = useMemo(() => (
        <Menu className="graph-tab-menu" onClick={({key}) => handleEdgeMenu(key)}>
            <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
    ), [handleEdgeMenu]);
    const aiflowMouseMove = useCallback(param => {
        const e = param.e;
        if (newModuleId.current) {
            const moduleAt = moduleData.find(m => m.id === newModuleId.current);
            const name = moduleAt.name;
            const scale = aiflowIns.current.drawGroup.scale[0];
            const newNode = {
                id: 'node' + (new Date()).valueOf(),
                defineData: {
                    nodeName: name
                },
                position: [e.event.zrX / scale, e.event.zrY / scale],
                input: [{}],
                output: [{}]
            };
            const node = aiflowIns.current.addNode(newNode);
            aiflowIns.current.setDragNode(node, param.e);
            newModuleId.current = '';
        }
    }, []);
    const aiflowContextMenu = useCallback(param => {
        const scale = aiflowIns.current.drawGroup.scale[0];
        setShowNodeMenu(false);
        setShowEdgeMenu(false);
        if (param.isNode) {
            setShowNodeMenu(true);
            setCurNode(param.props);
            setNodeMenuPos({
                left: param.dom.group.position[0] * scale,
                top: (param.dom.group.position[1] + 30) * scale
            });
        }
        else if (param.isEdge) {
            setShowEdgeMenu(true);
            setCurEdge(param.props);
            setEdgeMenuPos({
                left: param.e.event.zrX,
                top: param.e.event.zrY
            });
        }
    }, []);
    useEffect(() => {
        aiflowIns.current = new AIFlow(
            aiflowRef.current,
            {
                nodes,
                edges
            },
            GLOBAL_CONFIG
        );
        aiflowIns.current.on('mousemove', param => aiflowMouseMove(param));
        aiflowIns.current.on('contextmenu', param => aiflowContextMenu(param));
    }, []);

    return (
        <div className="ai-flow-dag-box">
            <div className="module-list-box">
                <ul>
                    {moduleData.map(module =>
                        <li key={module.id} onMouseDown={() => handleModuleMouseDown(module.id)}>{module.name}</li>)}
                </ul>
            </div>
            <div className="ai-flow-out-box">
                <div id="ai-flow--box" className="ai-flow-box" ref={aiflowRef}></div>
                <Dropdown
                    overlay={nodeMenu}
                    visible={showNodeMenu}
                    getPopupContainer={() => nodeMenuRef.current}
                    overlayClassName="workflow-dropdown-box"
                >
                    <div className="workflow-dropdown-box" style={nodeMenuPos} ref={nodeMenuRef} />
                </Dropdown>
                <Dropdown
                    overlay={edgeMenu}
                    visible={showEdgeMenu}
                    getPopupContainer={() => edgeMenuRef.current}
                    overlayClassName="workflow-dropdown-box"
                >
                    <div className="workflow-dropdown-box" style={edgeMenuPos} ref={edgeMenuRef} />
                </Dropdown>
            </div>
        </div>
    );
};
