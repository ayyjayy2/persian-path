// Numbers are taught in counting order until every one is known, then mixed (#56)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numbersKnown, countingOrder } from '../../number-order.js';

const n = (digit) => ({ key: 'numbers:' + digit, digit });
const w = (key) => ({ key });
const nums = [1, 2, 3, 10, 20, 100].map(n);

test('numbers are known once every one is in box 2 or higher', () => {
  const srs = Object.fromEntries(nums.map(x => [x.key, { b: 2 }]));
  assert.equal(numbersKnown(nums, srs), true);
  assert.equal(numbersKnown(nums, { ...srs, 'numbers:20': { b: 3 } }), true);
});

test('one weak or unseen number keeps them in order', () => {
  const srs = Object.fromEntries(nums.map(x => [x.key, { b: 4 }]));
  assert.equal(numbersKnown(nums, { ...srs, 'numbers:3': { b: 1 } }), false);
  const { ['numbers:100']: _, ...missing } = srs;
  assert.equal(numbersKnown(nums, missing), false);
  assert.equal(numbersKnown(nums, {}), false);
});

test('counting order sorts the numbers by value', () => {
  assert.deepEqual(countingOrder([n(100), n(3), n(1), n(20)]).map(x => x.digit), [1, 3, 20, 100]);
});

test('other words keep their places; numbers fill the number slots in order', () => {
  const out = countingOrder([w('a'), n(9), w('b'), n(2), n(5), w('c')]);
  assert.deepEqual(out.map(x => x.key), ['a', 'numbers:2', 'b', 'numbers:5', 'numbers:9', 'c']);
});

test('it returns a new array and leaves the input alone', () => {
  const pool = [n(3), n(1)];
  const out = countingOrder(pool);
  assert.notEqual(out, pool);
  assert.deepEqual(pool.map(x => x.digit), [3, 1]);
});
