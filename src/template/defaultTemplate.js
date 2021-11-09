/**
 * @file 默认模版
 * @author zhousheng
 */

export default {
    templateName: 'defaultTemplate',
    node: {
        box: {
            name: 'Rect',
            normal: {
                style: {
                    stroke: '#ccc',
                    fill: '#fff',
                    lineWidth: 1
                },
                shape: {
                    x: 0,
                    y: 0,
                    r: 5,
                    width: 170,
                    height: 30
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
                    r: 5,
                    width: 170,
                    height: 30
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
                    r: 5,
                    width: 170,
                    height: 30
                }
            }
        },
        text: {
            name: 'Text',
            position: [85, 15],
            normal: {
                style: {
                    text: '<@nodeName>',
                    fontFamily: 'PingFangSC-Regular',
                    fontSize: 15,
                    fill: '#333',
                    align: 'center',
                    verticalAlign: 'middle',
                    truncate: {
                        outerWidth: 110
                    }
                },
                z: 10
            },
            hover: {
                style: {
                    fontFamily: 'PingFangSC-Regular',
                    fontSize: 15,
                    textFill: 'green'
                }
            }
        },
        inputCircle: {
            name: 'Circle',
            normal: {
                style: {
                    stroke: '#79818F',
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
            // 自定义位置时，使用
            circlePosition: 'top',
            // 自动排序，水平排序时位置
            horizontalCirclePosition: 'left',
            // 自动排序，垂直排序位置
            verticalCirclePosition: 'top'
        },
        outputCircle: {
            name: 'Circle',
            normal: {
                style: {
                    stroke: '#79818F',
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
                    fill: 'grey',
                    lineWidth: 1
                },
                shape: {
                    r: 4
                }
            },
            circlePosition: 'bottom',
            // 自动排序，水平排序时位置
            horizontalCirclePosition: 'right',
            // 自动排序，垂直排序位置
            verticalCirclePosition: 'bottom'
        }
    },
    edge: {
        line: {
            name: 'BezierCurve',
            normal: {
                style: {
                    stroke: '#999',
                    lineWidth: 1
                }
            },
            hover: {
                style: {
                    stroke: '#333',
                    lineWidth: 1
                }
            },
            selected: {
                style: {
                    stroke: '#333',
                    lineWidth: 1
                }
            }
        },
        backline: {
            name: 'BezierCurve',
            normal: {
                style: {
                    stroke: '#ccc',
                    lineWidth: 1
                }
            },
            hover: {
                style: {
                    stroke: '#ccc',
                    lineWidth: 2
                }
            },
            selected: {
                style: {
                    stroke: '#ccc',
                    lineWidth: 2
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
                    fill: '#999'
                }
            },
            hover: {
                shape: {
                    width: 10,
                    height: 6
                },
                style: {
                    fill: '#333'
                }
            },
            selected: {
                shape: {
                    width: 10,
                    height: 6
                },
                style: {
                    fill: '#333'
                }
            }
        }
    }
};
