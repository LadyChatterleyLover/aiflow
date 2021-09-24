import AIFlow from '../../src/index';

// 自定义模版
let redTemplate = {
    node: {
        box: {
            name: 'Rect',
            normal: {
                style: {
                    stroke: '#ff0000',
                    fill: '#fff'
                },
                shape: {
                    x: 0,
                    y: 0,
                    r: 15,
                    width: 170,
                    height: 30
                }
            },
            hover: {
                style: {
                    stroke: '#2A2F44',
                    fill: 'rgba(0,29,255,0.10)'
                },
                shape: {
                    x: 0,
                    y: 0,
                    r: 15,
                    width: 170,
                    height: 30
                }
            },
            selected: {
                style: {
                    stroke: '#2A2F44',
                    fill: 'rgba(0,29,255,0.10)'
                },
                shape: {
                    x: 0,
                    y: 0,
                    r: 15,
                    width: 170,
                    height: 30
                }
            }
        },
        text: {
            name: 'Text',
            position: [31, 8],
            normal: {
                style: {
                    text: '<@nodeName>',
                    fontFamily: 'PingFangSC-Regular',
                    fontSize: 15,
                    textFill: '#ff0000'
                }
            }
        },
        inputCircle: {
            name: 'Circle',
            normal: {
                style: {
                    stroke: '#ff0000',
                    fill: '#fff',
                    lineWidth: 1
                },
                shape: {
                    r: 4
                }
            },
            hover: {
                style: {
                    stroke: '#394259',
                    fill: '#394259',
                    lineWidth: 1
                },
                shape: {
                    r: 4
                }
            },
            guide: {
                style: {
                    stroke: 'rgba(60,118,255,0.5)',
                    fill: '#fff',
                    lineWidth: 4
                },
                shape: {
                    r: 4
                }
            },
            guideHover: {
                style: {
                    stroke: 'rgba(60,118,255,0.5)',
                    fill: '#fff',
                    lineWidth: 6
                },
                shape: {
                    r: 6
                }
            },
            circlePosition: 'top'
        },
        outputCircle: {
            name: 'Circle',
            normal: {
                style: {
                    stroke: '#ff0000',
                    fill: '#fff',
                    lineWidth: 1
                },
                shape: {
                    r: 4
                }
            },
            hover: {
                style: {
                    stroke: '#79818F',
                    fill: '#fff',
                    lineWidth: 1
                },
                shape: {
                    r: 4
                }
            },
            circlePosition: 'bottom'
        }
    },
    edge: {
        line: {
            name: 'BezierCurve',
            normal: {
                style: {
                    stroke: '#ff0000',
                    lineWidth: 1
                }
            },
            hover: {
                style: {
                    stroke: '#79818F',
                    lineWidth: 1
                }
            },
            selected: {
                style: {
                    stroke: '#79818F',
                    lineWidth: 4
                }
            }
        },
        backline: {
            name: 'BezierCurve',
            normal: {
                invisible: true,
                style: {
                    stroke: '#f5f5f5',
                    lineWidth: 10
                }
            }
        },
        triangle: {
            name: 'Triangle',
            normal: {
                shape: {
                    width: 10,
                    height: 6
                },
                style: {
                    fill: '#ff0000'
                }
            },
            hover: {
                shape: {
                    width: 10,
                    height: 6
                },
                style: {
                    fill: '#404D5C'
                }
            },
            selected: {
                shape: {
                    width: 10,
                    height: 6
                },
                style: {
                    fill: '#404D5C'
                }
            }
        }
    }
};
AIFlow.registerTemplate('redTemplate', redTemplate);
// 渲染参数
let node1 = {
    // id
    id: '123',
    defineData: {
        nodeName: '数据拆分'
    },
    // 画布中位置
    position: [100, 100],
    // 输入
    input: [
        {
        }
    ],
    // 输出
    output: [
        {
            allInputs: true,
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let node2 = {
    // id
    id: '124',
    defineData: {
        nodeName: '随机采样'
    },
    // 画布中位置
    position: [400, 400],
    // 输入
    input: [
        {
        }
    ],
    // 输出
    output: [
        {
            allInputs: true,
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let nodes = [
    node1,
    node2
];
let edges = [
    {
        src: '123:0',
        to: '124:0',
        passPos: [[150, 150], [300, 300]]
    }
];
// 实例化
// 模版配置，主要用于样式
let globalConfig = {
    cWidth: 1000,
    cHeight: 800,
    // 是否静态图片
    isStatic: true,
    // 整个图默认模版
    templateName: 'redTemplate'
};
let workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);

workflow.on('click', (e, ins) => {
    console.log('e:', e);
    console.log('ins:', ins);
});
workflow.on('nodeSelected', (e, ins) => {
    console.log('e:', e);
    console.log('nodeSelected:', ins);
});

