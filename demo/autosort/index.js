import AIFlow from '../../src/index';

const statusOk = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAA9BJREFUWAnNWE1IVUEU/uZaviIJWxQm1j4hWgnxSqiFBBmBGzdGWK3DKGgTuBDcBEXiuh8iN26EqDYvMLAkiiAKDFpapNQiDa20fNN3zp157z716b12672BeTP3zvn53pkzZ865BgmbHcIOLKCdbG3se2HRyFG6tE8w7MAkew4ZPDRd+CoLcZuJS2hvooO059lbLbApDh+F/ybdGPugOYeRmDxrk9k7OIQ8rlqLrFAag0UOo7TEfY4TCGiRrWoV4ActlVdrNdNyJ7l+lHy1HIVvnLSXTTeeyXO5VtZCdhg1mMM1CuwRZgqc5tBH8UPmFL6VExh9b+9hO+F38V0v5TTIGuUMoA6XTCeWorR+viogexv1/IfDFNJGggUS92MzrpvTmPeMSUZ7F9vwCxfJc4XbnSGoHC3cac5gZrmcFYAUTB7jZNynVjHoIOPz5Ywbeabsg/yjI2ItKn7HLcwuBxVEBes2iWUEDPCG29OSFhjRo7JEpsFb0aG7IK4RaSWAnM+0qWUyaKevfIzQpjJVmbU4LjrEJURnVHBhy+Q02SU85YsFmvJImpaJKvRz3b48nqhP1eCwP31FC/FoO+L+JGC4zXX2Fl5o59wrXG90OvqVrqibtmCToEfzZXWreJrWE1ay/h3HyNsiHZyXrK33ICc33LqsC7whIPJJBJbWl/ho58PAp9zRub5Y+8fp6nNUiiHQu4nXAZEuStBbW8Q/WJVAG0b/VsESEMYJOpbcTaNxI3CasJzOUcVALAHvHrm1GST0bkpTV3xZXjexBASyx3FOxJeQOmWom1gCRstGFS+3dqWa100scuxDQD6FqASoom4FRH9iy3DzKtWKuq1YaEpxzGB3pfAwCfG6p8SpQ98JM73KYPK6iUUsNOlQNG8ITYD3Bb7ovPAy1sTrnhQLPVaWMAeOxR0lMt14ZQKmKtI5j67Fnhd154xeHT/xmcDkJtr5v6O1y7u/MPwE2IJdgaubxnhb17qEPPYf84S8qQ9I98+JRhYBqpvlkmARH5I2GA6sDiQhT9CYaO1n3HitnfMErHC6eh2PYlBAUsTxxh0n0gZXHcSXW4NZ8s4ziM0xO56Nz0hKViKiU3T7QrIQDP8mhVU/oPwk/lcuhS0Akn/GNPQGEfcQ8TQ9qoUKUk/yVc89NNFfXzrrDJizuCDvpXkfCp+komQRp1u3iEf8503hQnq/KlNkh1uVkyo2Kr3EQrJAU9YzAFSsUFwBqACqWkppb76q+tjgQam1quVzTBSUAquWD1YrgMknPVYHWhxIPr7aJz2LDzy/OYaOB0k/6f0BBTCI8+mB+YAAAAAASUVORK5CYII=';

// 渲染参数
let nodes = [
    {"id":"node1","defineData":{"nodeName":"分箱",},"input":[{}],"output":[{"enableInputs":[]},{"enableInputs":[]}],"position":[155,230]},
    {"id":"node2","defineData":{"nodeName":"XGBoost二分类",},"input":[{}],"output":[{"enableInputs":[]}],"position":[30,330]},
    {"id":"node3","defineData":{"nodeName":"数据集",},"input":[],"output":[{"enableInputs":[]}],"position":[280,30]},
    {"id":"node4","defineData":{"nodeName":"数据拆分",},"input":[{}],"output":[{"enableInputs":[]},{"enableInputs":[]}],"position":[280,130]},
    {"id":"node5","defineData":{"nodeName":"特征工程预测",},"input":[{},{}],"output":[{"enableInputs":[]}],"position":[280,330]},
    {"id":"node6","defineData":{"nodeName":"预测组件",},"input":[{},{}],"output":[{"enableInputs":[]}],"position":[30,430]},
    {"id":"node7","defineData":{"nodeName":"二分类评估",},"input":[{},{},{},{}],"output":[{"enableInputs":[]},{"enableInputs":[]}],"position":[30,530]}];
let edges = [
    {"src":"node3:0","to":"node4:0"},
    {"src":"node4:0","to":"node1:0"},
    {"src":"node4:1","to":"node5:1"},
    {"src":"node1:0","to":"node2:0"},
    {"src":"node1:1","to":"node5:0"},
    {"src":"node2:0","to":"node6:0"},
    {"src":"node5:0","to":"node6:1"},
    {"src":"node6:0","to":"node7:0"}];
// 实例化
// 模版配置，主要用于样式
let globalConfig = {
    cWidth: 800,
    cHeight: 800,
    // 是否静态图片，true：节点和连线都不可拖动，false：可以添加事件监听
    isStatic: true,
    // 整个图默认模版，默认为defaultTemplate
    templateName: 'mfTemplate',
    autoSort: {
        on: false,
        beginX: 20,
        beginY: 20,
        spaceX: 200,
        spaceY: 50,
        type: 'default'
    }
};
let workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
console.log(workflow.workflowObj);
document.getElementById('horizontalTop').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = true;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'start';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
document.getElementById('verticalLeft').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = false;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'start';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
document.getElementById('horizontalMiddle').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = true;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'middle';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
document.getElementById('verticalMiddle').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = false;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'middle';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
document.getElementById('horizontalBottom').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = true;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'end';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
document.getElementById('verticalRight').addEventListener('click', function () {
    globalConfig.autoSort.horizontal = false;
    globalConfig.autoSort.on = true;
    globalConfig.autoSort.align = 'end';
    workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);
});
