/**
 * @file GraphLayout
 * @author dailin
 */

import zrender from 'zrender';

/**
 * 1 创建节点、创建边
 * 2 将长边 变成虚拟节点+短边
 * 3 计算所有边的中位数 null 没有边
 * 4 最小化交叉
 *  - 重复计算次数，逐步最优化。从第二排计算到最后一排，算target，然后从倒数第二排计算到第一排，算source。
 *  - 按照中位数排序，如果交叉边比原来小，交换顺序
 *  - 更新中位数数据
 * 5 其余
 *  - 没有做 环
 *  - 没有做 异常处理
 *  - 压缩、layout功能
 *  - 没有做Port处理 - 先处理 inputPort
 *  - 预先处理只有一条边的两个节点
 */

export class GraphLayout {
    constructor(args) {
        const {
            nodes = [],
            edges = [],
            numRepeat = 1,
            hryType = 'default'
        } = args;

        /**
		 * 最初的节点信息 nodes
		 * @member {Array}
		 */
        this.nodes = nodes;

        /**
		 * 最初的边信息 edges
		 * @member {Array}
		 */
        this.edges = edges;

        /**
		 * 分层方法
		 * @member {String}
		 */
        this.hryType = hryType;

        /**
		 * 每一层级的节点信息 nodesLayer[layer][xPosition]
		 * @member {Array}
		 */
        this.nodesLayer = [];

        /**
		 * 节点信息 将Graph给的Node信息转换
		 * @member {Array}
		 */
        this.nodeList = [];

        /**
		 * edge信息 将Graph给的Edge信息转换
		 * @member {Array}
		 */
        this.adjList = [];

        /**
		 * 节点排序时重复优化的次数
		 * @member {number}
		 */
        this.numRepeat = numRepeat;
        if (this.numRepeat > 20) {
            this.numRepeat = 20;
        }

        /**
		 * 图的深度
		 * @member {Array}
		 */
        this.deepth = 1;
    }

    /**
	 *  创建画布重的视图节点.
     *
	 * @param {Object} params node parameter
	 * @property {number}	x 在层级里面的位置
	 * @property {number}	y 层级信息
	 * @property {number}	lx UI绘制的信息，暂时和x一致
	 * @property {number}	ly UI绘制的信息，暂时和y一致
	 * @property {Array}	trgNodes 指向的边集合
	 * @property {Array}	srcNodes 被指向的边集合
	 * @property {number}	wUpper 中位数 向上的指标
	 * @property {number}	wLower 中位数 向下的指标
	 * @property {boolean}	virt 虚拟节点
	 * @property {string}	label 描述
	 * @returns {Object}
	 */
    createGraphNode(params = {}) {
        const graphNode = {
            x: params.x || 0,
            y: params.y || 0,
            lx: params.lx || params.x || 0,
            ly: params.ly || params.y || 0,
            trgNodes: [],
            srcNodes: [],
            wUpper: params.wUpper || null,
            wLower: params.wLower || null,
            label: params.label,
            virtual: params.virtual
        };

        if ('id' in params) {
            graphNode.id = params.id;
        }

        return graphNode;
    }

    /**
     * 初始化Node节点
     * 1 按照层级排序到 this.nodesLayer
     * 2 记录每层个数
     * 3 处理异常
     *
     * @param {Array} nodeList
     * @returns {undefined}
     */
    generateNodeLayer(nodeList = []) {
        // 初始化节点
        nodeList.forEach(node => {
            const layer = node.layer;
            if (!this.nodesLayer[layer]) {
                this.nodesLayer[layer] = [];
            }
            const col = this.nodesLayer[layer].length;
            const graphNode = this.createGraphNode({
                x: col,
                y: layer,
                label: node.label,
                id: node.id
            });
            this.nodesLayer[layer][col] = graphNode;
            node.graphNode = graphNode;
        });

        // 填补没有处理的层级
        const len = this.nodesLayer.length;
        for (let i = 0; i < len; i++) {
            if (this.nodesLayer[i] === undefined) {
                this.nodesLayer[i] = [];
            }
        }
    }

    /**
     * 初始化Edge
     * this.nodesLayer[layer][xPosition]
     * 边 [x][y] - 第x个 第y层
     *
     * @param {Array} nodeList
     * @param {Array} adjList
     * @returns {undefined}
     */
    generateEdges(nodeList = [], adjList = []) {
        // set nodesLayer node srcNode & trgNode
        adjList.forEach((targets = [], index) => {
            targets.forEach(info => {
                const {
                    id: item,
                    toPort
                } = info;
                const targetNode = nodeList[item].graphNode;
                const sourceNode = nodeList[index].graphNode;
                const ty = targetNode.y;
                const tx = targetNode.x;
                const sy = sourceNode.y;
                const sx = sourceNode.x;
                // 到指向的Port节点
                this.nodesLayer[sy][sx].trgNodes.push([tx, ty, toPort || 0]);
                // 自身的Port节点
                this.nodesLayer[ty][tx].srcNodes.push([sx, sy, toPort || 0]);
            });
        });
    }

    /**
     * 将跨层边分成短边
     * 现在只处理了 只有一条边的情况，多个PORT默认当成一条边
     *
     * @param {Object} srcNode
     * @returns {undefined}
     */
    splitLongEdges(srcNode) {
        const {
            trgNodes
        } = srcNode;
        trgNodes.forEach((trgInfo, idx) => {
            const [tx, ty] = trgInfo;
            const trgNode = this.nodesLayer[ty][tx];
            // 拆边
            let distance = trgNode.y - srcNode.y;
            const linkNodes = [trgInfo];

            while (distance > 1) {
                // create Vir Node
                const vitrualY = srcNode.y + distance - 1;
                const vitrualX = this.nodesLayer[vitrualY].length;
                const virtualNode = this.createGraphNode({
                    y: vitrualY,
                    x: vitrualX,
                    label: null,
                    virtual: true
                });
                linkNodes.unshift([vitrualX, vitrualY]);
                this.nodesLayer[vitrualY].push(virtualNode);
                distance--;
            }
            // 连线
            if (linkNodes.length > 1) {
                const replaceIdx = trgNode.srcNodes.findIndex(item => item[1] === srcNode.y && item[0] === srcNode.x);
                linkNodes.reduce((srcInfo, trgInfo, cutIdx) => {
                    const [sx, sy] = srcInfo;
                    const [tx, ty] = trgInfo;
                    const srcNode = this.nodesLayer[sy][sx];
                    const trgNode = this.nodesLayer[ty][tx];
                    // 替换长边
                    cutIdx === 0 ? srcNode.trgNodes.splice(idx, 1, trgInfo) : srcNode.trgNodes.push(trgInfo);
                    cutIdx === (linkNodes.length - 1)
                        ? trgNode.srcNodes.splice(replaceIdx, 1, srcInfo)
                        : trgNode.srcNodes.push(srcInfo);

                    return trgInfo;
                }, [srcNode.x, srcNode.y]);
            }
        });
    }

    /**
     * 计算中位数
     *
     * @param {Object} node
     * @param {boolean} isUpper
     * @returns {number} 中位数
     */
    getMedian(node, isUpper) {
        const linkedNodes = isUpper ? node.srcNodes : node.trgNodes;
        const weights = linkedNodes.map(item => {
            const node = this.nodesLayer[item[1]][item[0]];
            if (!isUpper) {
                const port = item[2];
                return Number(`${node.x}.${port}`);
            }
            return node.x;
        });
        weights.sort((a, b) => a - b);
        const edgesLenght = weights.length;
        const middle = Math.floor(weights.length / 2);
        if (edgesLenght % 2 !== 0) {
            return weights[middle];
        }
        return (weights[middle - 1] + weights[middle]) / 2;
    }

    // 给整张图计算中位数
    setNodeWeights() {
        this.nodesLayer.forEach(list => {
            list.forEach(node => {
                if (node.srcNodes.length) {
                    node.wUpper = this.getMedian(node, true);
                }
                if (node.trgNodes.length) {
                    node.wLower = this.getMedian(node, false);
                }
            });
        });
    }

    // 将长边变成(短边+节点) + 计算中位数
    proxyNodes() {
        this.nodesLayer.forEach(list => {
            list.forEach(node => {
                if (!node.virtual && node.trgNodes.length > 0) {
                    this.splitLongEdges(node);
                }
            });
        });
        this.setNodeWeights();
    }

    compareByUp(a, b) {
        if (a.wUpper === null) {
            return 1;
        }
        if (b.wUpper === null) {
            return -1;
        }
        return a.wUpper - b.wUpper;
    }

    compareByDown(a, b) {
        if (a.wLower === null) {
            return 1;
        }
        if (b.wLower === null) {
            return -1;
        }
        return a.wLower - b.wLower;
    }

    /**
     * 计算交叉边
     * 因为是两层之间 所以存储边为[l1.x, l2.x]
     *
     * @param {Array} list 边
     * @param {boolean} isUp 方向
     * @returns {number}
     */
    countCrossings(list, isUp) {
        let cross = 0;
        const key = isUp ? 'srcNodes' : 'trgNodes';
        const links = [];
        list.forEach((node, index) => {
            const edges = node[key] || [];
            edges.forEach(info => {
                links.push([index, Number(`${info[0]}.${info[2]}`)]);
            });
        });

        links.forEach((curentLink, cutIdx) => {
            links.forEach((compareLink, comIdx) => {
                if (cutIdx !== comIdx) {
                    if (curentLink[0] > compareLink[0] && curentLink[1] < compareLink[1]) {
                        cross++;
                    }
                    if (curentLink[0] < compareLink[0] && curentLink[1] > compareLink[1]) {
                        cross++;
                    }
                }
            });
        });
        // 重复计算了两次，所以除2
        return (cross / 2);
    }

    // 给每层排序
    orderLayer(layer, isUp) {
        const preCross = this.countCrossings(this.nodesLayer[layer], isUp);
        const orderLayer = [...this.nodesLayer[layer]];
        orderLayer.sort(isUp ? this.compareByUp : this.compareByDown);
        const curentCross = this.countCrossings(orderLayer, isUp);

        if (curentCross < preCross) {
            // 交换X
            orderLayer.forEach((node, newX) => {
                const oldX = node.x;
                node.x = newX;
                node.lx = newX;
                // edges & middle
                node.trgNodes.forEach(info => {
                    const changedNode = this.nodesLayer[info[1]][info[0]];
                    const replaceIdx = changedNode.srcNodes.findIndex(item => item[0] === oldX);
                    changedNode.srcNodes[replaceIdx] = [newX, changedNode.srcNodes[replaceIdx][1]];
                });
                node.srcNodes.forEach(info => {
                    const changedNode = this.nodesLayer[info[1]][info[0]];
                    const replaceIdx = changedNode.trgNodes.findIndex(item => item[0] === oldX);
                    changedNode.trgNodes[replaceIdx] = [newX, changedNode.trgNodes[replaceIdx][1]];
                });
            });

            this.nodesLayer[layer] = orderLayer;

            // 重新计算中位数
            const preLayer = this.nodesLayer[layer - 1] || [];
            const nextLayer = this.nodesLayer[layer + 1] || [];
            preLayer.forEach(node => {
                node.wLower = this.getMedian(node, false);
            });
            nextLayer.forEach(node => {
                node.wUpper = this.getMedian(node, true);
            });
        }
    }



    minimizeCrossings(repeatNum) {
        // 不断重复以求找到最优解
        for (let num = 0; num <= repeatNum; num++) {
            this.nodesLayer.forEach((nodeList, layer) => {
                // 从第一层开始，比往上的边
                if (layer !== 0) {
                    this.orderLayer(layer, true);
                }
            });
            let i = this.nodesLayer.length - 2;
            for (i; i > -1; i--) {
                this.orderLayer(i, false);
            }

            // TODO - 两层都排序一下 然后再计算
        }
    }

    convertToLayout(nodes, edges) {
        /**
		 * 节点信息 将Graph给的Node信息转换
		 * @member {Array}
		 */
        this.nodeList
            = nodes.map(item => (
                {
                    // label: item.defineData.nodeName,
                    label: '',
                    id: item.id,
                    layer: item.level - 1
                }));

        this.idMap = {};
        this.nodeList.forEach(item => {
            // 暂时不处理Port情况 后续需要处理
            this.idMap[item.id] = new Set();
        });
        edges.forEach(item => {
            const src = item.src.split(':')[0];
            const toPath = item.to.split(':');
            const toId = toPath[0];
            const toPort = toPath[1];
            const id = this.nodeList.findIndex(node => node.id === toId);
            // 多个Port 可能有多个连线 - TODO
            this.idMap[src].add({
                id,
                toPort: Number(toPort)
            });
        });

        /**
		 * edge信息 将Graph给的Edge信息转换
		 * @member {Array}
		 */
        this.adjList = [];
        this.nodeList.forEach(item => {
            this.adjList.push([...this.idMap[item.id]]);
        });
    }

    computeHry(nodes, edges) {
        // 最大深度
        let deepth = 0;
        nodes.forEach(node => {
            node.level = 1;
        });
        // 深度
        // 递归遍历，寻找最大深度
        function getSrcIds(id, preArr, nodeParents) {
            edges.forEach(edge => {
                if (edge.to.split(':')[0] === id) {
                    // 遇到一个，裂变一个数组
                    let tempArr = zrender.util.clone(preArr);
                    nodeParents[nodeParents.length] = tempArr;
                    const srcId = edge.src.split(':')[0];
                    tempArr.push(srcId);
                    getSrcIds(srcId, tempArr, nodeParents);
                }
            });
        }
        // 确定level，遍历node
        nodes.forEach(node => {
            const nodeParents = [];
            getSrcIds(node.id, [node.id], nodeParents);
            node.nodeParents = nodeParents;
            const nodeDepthArr = nodeParents.map(item => item.length);
            node.level = Math.max(...nodeDepthArr, 1);
            if (node.level > deepth) {
                deepth = node.level;
            }
        });

        this.deepth = deepth;
    }

    // 重心法分层 节点尽量靠下
    computeHryWithGravity(nodes = [], edges = []) {
        const nodeMap = {};
        const edgeInfo = {};
        const rootList = [];

        // 预先处理节点
        nodes.forEach(node => {
            nodeMap[node.id] = node;
            edgeInfo[node.id] = {
                src: [],
                to: []
            };
        });
        edges.forEach(edge => {
            let {
                to: edgeTo,
                src: edgeSrc
            } = edge;
            edgeTo = edgeTo.split(':')[0];
            edgeSrc = edgeSrc.split(':')[0];

            // 需要判断边的输入对不对
            if (!edgeInfo[edgeTo]) {
                edgeInfo[edgeTo] = {
                    src: [],
                    to: []
                };
            }
            if (!edgeInfo[edgeSrc]) {
                edgeInfo[edgeSrc] = {
                    src: [],
                    to: []
                };
            }
            edgeInfo[edgeTo].src.push(edgeSrc);
            edgeInfo[edgeSrc].to.push(edgeTo);
        });

        let list = [];
        Object.keys(nodeMap).forEach(key => {
            if (!edgeInfo[key].to.length) {
                list.push(key);
            }
            // 获取一个入度为0的根节点
            if (!edgeInfo[key].src.length) {
                rootList.push(nodeMap[key]);
            }
        });

        let level = 0;
        function getLevel(node) {
            if (node.level !== undefined) {
                return node.level;
            }
            // 没有儿子节点了，默认放最后一层
            const src = edgeInfo[node.id].to || [];
            if (!src.length) {
                node.level = 0;
                return 0;
            }

            // 计算 所有儿子节点中层数最小的
            const list = src.map(id => getLevel(nodeMap[id]));
            const min = Math.min(...list);
            node.level = min - 1;
            if (level > node.level) {
                level = node.level;
            }
            return node.level;
        }
        rootList.forEach(rootNode => getLevel(rootNode));

        // 转换
        nodes.forEach(node => {
            if (isNaN(node.level)) {
                node.level = 0;
            }
            node.level = node.level - level + 1;
        });
    }

    getHierarchy(type = 'default') {
        if (type === 'default') {
            this.computeHry(this.nodes, this.edges);
        }
        else if (type === 'barycenter') {
            this.computeHryWithGravity(this.nodes, this.edges);
        }

        this.convertToLayout(this.nodes, this.edges);
    }

    render() {
        try {
            this.getHierarchy(this.hryType);
            this.generateNodeLayer(this.nodeList);
            this.generateEdges(this.nodeList, this.adjList);
            this.proxyNodes();
            this.minimizeCrossings(this.numRepeat);
        }
        catch (e) {
            // 使用老的排序功能
        }
    }
}