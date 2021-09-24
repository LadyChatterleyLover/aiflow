# AIFlow

简单易用的流程图库，可用于流程图展示，也可用于拖拉拽工作台模式


## demo

拖拉拽工作台：https://auto-workflow.github.io/aiflow/output/demo/dag/index.html

动画：https://auto-workflow.github.io/aiflow/output/demo/animate/index.html

自动排序：https://auto-workflow.github.io/aiflow/output/demo/autosort/index.html

自定义模版：https://auto-workflow.github.io/aiflow/output/demo/custom/index.html

默认模版的各种操作：https://auto-workflow.github.io/aiflow/output/demo/defaultTemplate/index.html

流程图：https://auto-workflow.github.io/aiflow/output/demo/process/index.html


## 技术文档

### API文档

https://auto-workflow.github.io/aiflow/doc/api/AIFlow.html


### 快速开始

#### 安装

npm i aiflow

#### 引用

import AIFlow from 'aiflow';

####  1，定义node:

```javascript
let node1 = {
    // 唯一标识，必须
    id: '123',
    // 自定义数据，用于填充模版
    defineData: {
        nodeName: '数据拆分'
    },
    // 画布中位置
    position: [100, 100],
    // 输入圈，对象数组，每个对象表示一个输入，以下标区分
    input: [
        {
        }
    ],
    // 输出圈，对象数组，每个对象表示一个输出。enbaleInputs：对象数组，每个对象定义可以输入的圈信息（id对应节点，inputIndex对应输入点下标），如果undefined,则所以输入点都能连接，如果是空数组，则所有输入点都不能连接。
    output: [
        {
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let node2 = {
    // 使用的模版，默认使用defaultTemplate
    templateName: 'iconTemplate',
    id: '124',
    defineData: {
        nodeName: '随机采样',
        imgSrc: 'base64...'
    },
    // 画布中位置
    position: [300, 100],
    // 输入
    input: [
        {
        }
    ],
    // 输出
    output: [
    ]
};
```

####  2，定义节点关系:

```javascript
let edges = [
    {
        // 输出节点及输出圈，‘123:0’表示id为123的node的下标为0的输出点
        src: '123:0',
        // 输入节点及输入圈，'124:0'表示id为124的node的下标为0的输入点
        to: '124:0'
    }
];
```

####  3，实例化:

```javascript
// 全局配置
let globalConfig = {
    // 是否静态图片，true：节点和连线都不可拖动，false：不做限制
    isStatic: false,
    // 整个图默认模版，默认为defaultTemplate
    templateName: 'defaultTemplate',
    // templateName: 'iconTemplate',
    // 自动排序参数配置
    autoSort: {
        // 是否需要自动排序，true: 程序智能计算每个node的位置，false: 根据node position来定位
        on: true
        // 可选，开启自动排序时，配置type。不配置: 使用默认排序方法，withMedium: 使用中位数排序法
        type: 'withMedium',
        // 自动排序时，true: 水平排序，false: 垂直排序
        horizontal: false,
        // 可选，node对齐方式，start: 水平排列时表示上对齐，垂直排列时表示左对齐 middle: 中间对齐 end: 水平排列时表示下对齐，垂直排列时表示右对齐
        align: 'middle',
        // 可选，beginX 起点X坐标，默认10 可选类型: number | 'center' | 'left' | 'right'
        beginX: 30,
        // 可选，beginY 起点Y坐标，默认10 可选类型: number | 'middle' | 'top' | 'bottom'
        beginY: 30,
        // 可选，spaceX 横向间距，默认200
        spaceX: 200,
        // 可选，spaceY 纵向间距，默认100
        spaceY: 60,
        // 可选，开启中位数排序法时，处理超出画布逻辑 默认'default'(起点变为0，0) | justify(自动左上角移动) | hidden(隐藏超出部分)
        overflow: 'hidden',
        // 可选, 设定分层方法。不填写: 默认分层方法 ｜ barycenter: 重心法，所有节点尽量往底层放
        hryType: 'barycenter'
    }
};
// 实例化
const aiflowIns = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
```

#### 事件监听

```javascript
// AIFlow支持7种鼠标事件和15种自定义事件
// const MOUSE_EVENTS = ['mousedown', 'click', 'mouseover', 'mouseout', 'mouseup', 'mousemove', 'contextmenu'];
// const CUSTOM_EVENTS = ['dragNode', 'dragNodeEnd', 'addEdge', 'removeEdge', 'addNode', 'removeNode', 'nodeSelected', 'edgeSelected', 'copyNodes', 'pasteNodes', 'frameSelectInit', 'frameSelectEnd', 'pan', 'zoom', 'graphTransformed'];
aiflowIns.on('contextmenu', (e, ins) => {
    console.log('e:', e);
    console.log('ins', ins);
});
aiflowIns.on('nodeSelected', (e, ins) => {
    console.log('e:', e);
    console.log('ins', ins);
});
```

### 基础概念

#### node

节点，可以定义使用的模版，模版中参数，输入，输出圈信息

#### edge

连线，可以定义模版，连线信息

#### 模版

模版是形状和样式的结合体，定义了节点（node）和连线（edge）的具体形状和样式

默认为defaultTemplate，由矩形和文案组成

系统内置iconTemplate模版，由一个icon和文案组成

系统内置菱形模版diamondTemplate，由菱形和文案组成

当然还可以自定义模版，可以参考demo，定义了一个红色模版

定义的模版可以在node和edge中使用，这样就可以画出不同的节点和连线了

#### 自定义模版

```javascript
// 模版对象，可以参考src/template下的模版配置
let redTemplate = {
    node: {
        // 元素名称为'box'
        box: {
            // name为形状，目前支持Rect、Circle、Image、Text、Line、Polygon、Text、Triangle、Beziercurve
            // 每种形状的具体配置，可以参考zrender文档：https://ecomfe.github.io/zrender-doc/public/api.html#zrenderdisplayable
            name: 'Rect',
            // 正常态的样式配置
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
            // hover态
            hover: {...},
            // 选中态
            selected: {...}
        },
        ...
    },
    edge: {...}
};
// 组册模版
AIFlow.registerTemplate('redTemplate', redTemplate);
// 在项目中使用
let globalConfig = {
    templateName: 'redTemplate',
    ...
};
```

### 高级用法，自定义node和edge的基础绘制方法   

#### DrawView
在渲染工作流中，为了方便地处理缩放，所以整个工作流的图形集合是一个对象，对应zrender中的```Group```类，默认情况下是AIFlow中的```DrawView```类，在```DrawView```中包含了```NodeView```和```EdgeView```，```NodeView```和```EdgeView```是由不同的Shape组成的Group。    
如果想自定义一个渲染规则，可以参考```src/draw/basicdraw/DrawView.js```中的代码，使用```Draw.extend()```实现一个自定义的类，需要设置```type```字段，并且实现```render()```方法，```render()```方法中需要将最终使用的zrender的形状实例对象return出去，以便于在AIFlow中add到zrender对象中。
    
#### NodeView
Node是工作流中的节点，默认的实现类是```src/draw/basicDraw/NodeView```，父类是```src/draw/Node```，Node也是一个```Group```，包含了像文字（Text），图标（Image），矩形（Rect）等基本形状。在NodeView中render输入输出点的时候，会根据点的个数和Node的position来计算出每个点的坐标来绘制，同时可以在config中配置input或者output在node中的位置，如top、right、bottom、left。    
同样，如果想要自定义一个Node，需要使用```Node.extend()```方法，需要定义type和实现```render()```方法，```render()```方法中需要将最终使用的zrender的形状实例对象return出去，以便于在```DrawView```或者父集合对象中add到对应的Group对象中。   
#### EdgeView
Edge是工作流中的连线，默认的实现类是```src/draw/basicDraw/EdgeView```，父类是```src/draw/Edge```，Edge也是一个```Group```，包含了像贝塞尔曲线和三角形箭头基本形状。渲染连线需要在渲染节点之后进行，因为连线的信息只有节点信息没有坐标信息，所以需要在节点渲染后，根据起止节点来计算处连线的起始点坐标，同时会根据箭头的位置对终点坐标进行细微的调整。     
同样，如果想要自定义一个Edge，需要使用```Edge.extend()```方法，需要定义type和实现```render()```方法，```render()```方法中需要将最终使用的zrender的形状实例对象return出去，以便于在```DrawView```或者父集合对象中add到对应的Group对象中。   

#### Shape
Shape是一些基本形状，目前实现了的有BezierCurve、CirCle、Image、Text、React、Triangle，是对zrender中Displayable中的简单封装。在使用Shape的时候，需要先实例化，然后调用```shape.init()```方法实例化对应的zrender对象，init之后```shape.dom```中存储便是对应的zrender对象。
需要自定义Shape的时候，需要使用```Shape.extend()```方法。和上面几个类似，具体可参考```src/draw/shape```目录中的代码

## 测试

npm run test

## 如何贡献

## 讨论

qq群：869605396
