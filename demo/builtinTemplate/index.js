import AIFlow from '../../src/index';

const loadingImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAABIJJREFUWAntV11oXEUUnnP3bhJNNilWxcQXyT4Jgg++G2sQwRZ9crXaZOuiyTa2FbRtwG10NZuqSbHQKm6aWrOhWI1a/AMlLYLimw+lfZPS0Jd2qYrmZ4NJd3fG72z2hrtz791k94KgdCC5M3e+891vzpk5c5aEz7ZzV+JlWRRvC1LLROZzmfSbX/ihNPwYs61S4l4lVFApCkklH/DLZ/olgJClVQ4FJwnll8+3h/wK0O0dHkomk8blbOEjQ6hLmfGRlG7gd6zg0mj/a4cEydZMOrWbCH61NYcgFoON0SuVuNHbd/C+zg7zGYiUNpu6u7zYaP/Br6FgKwc32j90BWRjdkJHyAwlfgeAN0QDtsS22WuFj5nIblRPf3p6OnD5av4rIaib6dEW0b9N53J8aHJ8eD+RmAF4GYbN64pSakmQKJTwRGH9AzxmMd+cvfAlcFuUkE3A8kGY6ewIJHS8QxDHtLM9+BgW8YMonaDqoppEaBRYhJ5+bmsw+/QP2MXwAstivg93BCNuW4F0AmsMsLnqYtGF8DVD6IIQxikkPsdGtGz0J4d6Nlv8HF55EPty83pi2N7hIYsUZIXw3cEnMP5RQAxOR6tSciC2963bLcx6zyu/iTuFktvKYhju6RmLy9NDFqDkqWz+LMLyEHb62KnjqQPW3EaePfFXE0JSCof78NTEyP6N2KyLYdfv2zeG+NfXBgaSLfVZ3rT6D3gA90pie1HS/W5aDUOEzbZQ7OToILKq/xY78E6osLD4CuonJMfKhmTcYhBdNHFyThDJWyunyyNFy/m5hTMYPeI6X+NLcCGXiQJyr+MORY5CdlDzBv7dwgO3P9w4Qcx01fjdKnA6j0nkPrfvsRlJkwQNIvHdI6XA3VXZyJA5s631cOXb+kctgebunMxllDQu6SxExUYyjJ/09zfH/w8P8NXR++Ih3Nb1tZ0Dybu4dN2ItedtbxlzPYOq8TOVX/ojGk/UdLEyx454YqJYyGdRrr7PC7N4vZ5VVbOYb89dPIN6aAtWGOLj2tAc3PzhkeSfXoT297HdyY78jfzVUkUsaBGn+bvOdnM7hHnW6J6K18QI1c1ikB4WkU1Pn3j39b/sH63WP/le8hopmuaFoBQOCam2zmYLp6t5yiVjrtbAJc+wmHLZiSQ5E24P7tB/tuzZc7RxbuV6KYdtagy2HTuW5Gy81qYmUk/1vJBA+UFdiitPKUqisMindS42cvWQLgY410oPKzXnV65/gPkiYp+fWynG2LNMbG9rlSdqdBaFO+LxaHzoEzvG6jsE9fYNPQ+jR9kzuOf+BtBVDBNAUIHLW3QDwOOakXdEIpEiz9kb4ypECdUED0V6+ofidhz3HYKwgR9GwBvh4pUAqU+nxlNPgtBzE+qEXmO7KNzq8+DP4Tdgg453CMqkh59F2TEYMIz4ZHok5hZnnWSj4zVRRG+QQS9ljg8f1W0dm7osYJSBk+lhHe97zKJAcsSLyOEhL+C/9d63oFUC/q3OuUa4F3o1rMYRshpsS1BFxi84xjmoMbDvfq3VXsf/A0C84hCwwGHOAAAAAElFTkSuQmCC';

// 渲染参数
let node1 = {
    id: '1',
    templateName: 'defaultTemplate',
    defineData: {
        nodeName: 'default'
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

        }
    ]
};

let node2 = {
    templateName: 'diamondTemplate',
    id: '2',
    defineData: {
        nodeName: 'diamond'
    },
    // 画布中位置
    position: [100, 200],
    // 输入
    input: [
        {
            align: 'top'
        }
    ],
    // 输出
    output: [
        {
            align: 'bottom'
        }
    ]
};

let node3 = {
    id: '3',
    templateName: 'iconTemplate',
    defineData: {
        nodeName: 'icon',
        imgSrc: loadingImg
    },
    // 画布中位置
    position: [200, 400],
    // 输入
    input: [
        {
        }
    ],
    // 输出
    output: [
        {
        }
    ]
};

let node4 = {
    id: '4',
    templateName: 'circleTemplate',
    defineData: {
        nodeName: 'circle'
    },
    // 画布中位置
    position: [100, 500],
    // 输入
    input: [
        {
        },
        {
        },
        {
        },
        {
        }
    ],
    // 输出
    output: [{}, {}, {}]
};

const nodes = [
    node1,
    node2,
    node3,
    node4
];

const edges = [
    {
        src: '1:0',
        to: '2:0'
    },
    {
        src: '2:0',
        to: '3:0'
    },
    {
        src: '3:0',
        to: '4:2'
    }
];

// 模版配置，主要用于样式
let globalConfig = {
    cWidth: 1000,
    cHeight: 800
};

let workflow = new AIFlow(document.getElementById('aw'), {nodes, edges}, globalConfig);