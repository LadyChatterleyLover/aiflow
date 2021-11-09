import AIFlow from '../../src/index';

const statusOk = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAA9BJREFUWAnNWE1IVUEU/uZaviIJWxQm1j4hWgnxSqiFBBmBGzdGWK3DKGgTuBDcBEXiuh8iN26EqDYvMLAkiiAKDFpapNQiDa20fNN3zp157z716b12672BeTP3zvn53pkzZ865BgmbHcIOLKCdbG3se2HRyFG6tE8w7MAkew4ZPDRd+CoLcZuJS2hvooO059lbLbApDh+F/ybdGPugOYeRmDxrk9k7OIQ8rlqLrFAag0UOo7TEfY4TCGiRrWoV4ActlVdrNdNyJ7l+lHy1HIVvnLSXTTeeyXO5VtZCdhg1mMM1CuwRZgqc5tBH8UPmFL6VExh9b+9hO+F38V0v5TTIGuUMoA6XTCeWorR+viogexv1/IfDFNJGggUS92MzrpvTmPeMSUZ7F9vwCxfJc4XbnSGoHC3cac5gZrmcFYAUTB7jZNynVjHoIOPz5Ywbeabsg/yjI2ItKn7HLcwuBxVEBes2iWUEDPCG29OSFhjRo7JEpsFb0aG7IK4RaSWAnM+0qWUyaKevfIzQpjJVmbU4LjrEJURnVHBhy+Q02SU85YsFmvJImpaJKvRz3b48nqhP1eCwP31FC/FoO+L+JGC4zXX2Fl5o59wrXG90OvqVrqibtmCToEfzZXWreJrWE1ay/h3HyNsiHZyXrK33ICc33LqsC7whIPJJBJbWl/ho58PAp9zRub5Y+8fp6nNUiiHQu4nXAZEuStBbW8Q/WJVAG0b/VsESEMYJOpbcTaNxI3CasJzOUcVALAHvHrm1GST0bkpTV3xZXjexBASyx3FOxJeQOmWom1gCRstGFS+3dqWa100scuxDQD6FqASoom4FRH9iy3DzKtWKuq1YaEpxzGB3pfAwCfG6p8SpQ98JM73KYPK6iUUsNOlQNG8ITYD3Bb7ovPAy1sTrnhQLPVaWMAeOxR0lMt14ZQKmKtI5j67Fnhd154xeHT/xmcDkJtr5v6O1y7u/MPwE2IJdgaubxnhb17qEPPYf84S8qQ9I98+JRhYBqpvlkmARH5I2GA6sDiQhT9CYaO1n3HitnfMErHC6eh2PYlBAUsTxxh0n0gZXHcSXW4NZ8s4ziM0xO56Nz0hKViKiU3T7QrIQDP8mhVU/oPwk/lcuhS0Akn/GNPQGEfcQ8TQ9qoUKUk/yVc89NNFfXzrrDJizuCDvpXkfCp+komQRp1u3iEf8503hQnq/KlNkh1uVkyo2Kr3EQrJAU9YzAFSsUFwBqACqWkppb76q+tjgQam1quVzTBSUAquWD1YrgMknPVYHWhxIPr7aJz2LDzy/OYaOB0k/6f0BBTCI8+mB+YAAAAAASUVORK5CYII=';

// 渲染参数
let node1 = {
    // id
    id: '123',
    defineData: {
        nodeName: '数据拆分',
        imgSrc: statusOk
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
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let node2 = {
    // id
    templateName: 'iconTemplate',
    id: '124',
    defineData: {
        nodeName: '随机采样',
        imgSrc: statusOk
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
        {
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let node3 = {
    // id
    id: '1245',
    defineData: {
        nodeName: 'asdfsdf'
    },
    // 画布中位置
    position: [100, 300],
    // 输入
    input: [
        {
        }
    ],
    // 输出
    output: [
        {
            enbaleInputs: [{
                id: '124',
                inputIndex: 0
            }]
        }
    ]
};
let nodes = [
    node1,
    node2,
    node3
];
let edges = [
    {
        src: '123:0',
        to: '124:0'
    },
    {
        src: '124:0',
        to: '1245:0'
    }
];
// 实例化
// 模版配置，主要用于样式
let globalConfig = {
    cWidth: 800,
    cHeight: 500,
    // 是否静态图片
    isStatic: false,
    // 整个图默认模版
    // templateName: 'defaultTemplate',
    templateName: 'iconTemplate'
};
let aiflowInstance = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
aiflowInstance.on('addNode', function (node) {
    console.log('custom addNode triggered!', node);
});
aiflowInstance.on('removeNode', function (node) {
    console.log('custom removeNode triggered!', node);
});
aiflowInstance.on('dragNode', function (node) {
    console.log('custom dragNode triggered!', node);
});

// 获取所有nodes图形对象集
aiflowInstance.getNodesIns();
// 获取指定id的node图形对象
aiflowInstance.getNodeInsById('123');
// 获取所有edges图形对象集
aiflowInstance.getEdgesIns();
// 获取指定edge图形对象
aiflowInstance.getEdgeInsById('123:0', '124:0');

let zoom = 1;
document.getElementById('zoomin').addEventListener('click', function () {
    zoom += 0.1;
    zoom = Math.min(2, zoom);
    aiflowInstance.setScale(zoom, [0, 0]);
});
document.getElementById('zoomout').addEventListener('click', function () {
    zoom -= 0.1;
    zoom = Math.max(0.1, zoom);
    aiflowInstance.setScale(zoom, [0, 0]);
});
document.getElementById('reset').addEventListener('click', function () {
    aiflowInstance.setScale(1, [0, 0]);
});
document.getElementById('add-node').addEventListener('click', function () {
    aiflowInstance.addNode({
        id: '1325',
        // 输入
        input: [
            {
            }
        ],
        defineData: {
            nodeName: 'new-node'
        }
    });
});
document.getElementById('remove-node').addEventListener('click', function () {
    aiflowInstance.removeNode({
        id: '1325'
    });
});
document.getElementById('add-edge').addEventListener('click', function () {
    aiflowInstance.addEdge({
        src: '123:0',
        to: '1245:0'
    });
});
document.getElementById('remove-edge').addEventListener('click', function () {
    aiflowInstance.removeEdge({
        src: '123:0',
        to: '1245:0'
    });
});
document.getElementById('update-node').addEventListener('click', function () {
    aiflowInstance.updateNode('123', 'box', {
        style: {
            stroke: '#ff0000'
        }
    });
});
