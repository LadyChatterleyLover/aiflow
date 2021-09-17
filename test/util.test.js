/**
 * @file test
 * @author zhousheng
 */

import {
    mergeArrays,
    calcuBezizerControlPoints,
    cacluTrianglePoints
} from '../src/utils';

test('utils.mergeArrays', () => {
    expect(mergeArrays([1, 2], [3, 4])).toStrictEqual([4, 6]);
});

test('utils.calcuBezizerControlPoints', () => {
    expect(calcuBezizerControlPoints([0, 0], [100, 100], 'bottom')).toStrictEqual([[0, 20], [100, 80]]);
});

test('utils.cacluTrianglePoints', () => {
    expect(cacluTrianglePoints(10, 6, [100, 100], 'bottom')).toStrictEqual([[100, 100], [95, 94], [105, 94]]);
});
