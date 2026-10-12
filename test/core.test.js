import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSparseTable, defaultCombine } from '../src/index.js';

const maxOf = (a, b) => (a >= b ? a : b);

test('range minimum query on a typical array', () => {
  const t = createSparseTable([5, 2, 4, 7, 1, 8, 3, 6]);
  assert.equal(t.query(0, 5), 1);
  assert.equal(t.query(0, 7), 1);
  assert.equal(t.query(3, 4), 1);
  assert.equal(t.query(1, 2), 2);
  assert.equal(t.query(5, 7), 3);
});

test('range maximum query using custom combiner', () => {
  const t = createSparseTable([5, 2, 4, 7, 1, 8, 3, 6], maxOf);
  assert.equal(t.query(0, 5), 8);
  assert.equal(t.query(0, 7), 8);
  assert.equal(t.query(3, 4), 7);
  assert.equal(t.query(1, 2), 4);
  assert.equal(t.query(5, 7), 8);
});

test('single element array', () => {
  const t = createSparseTable([42]);
  assert.equal(t.size, 1);
  assert.equal(t.query(0, 0), 42);
});

test('single element range within larger array', () => {
  const t = createSparseTable([9, 3, 7, 1, 5]);
  assert.equal(t.query(2, 2), 7);
  assert.equal(t.query(0, 0), 9);
  assert.equal(t.query(4, 4), 5);
});

test('entire array range', () => {
  const t = createSparseTable([9, 3, 7, 1, 5], maxOf);
  assert.equal(t.query(0, 4), 9);
});

test('array of length two', () => {
  const t = createSparseTable([3, 1]);
  assert.equal(t.query(0, 1), 1);
  assert.equal(t.query(0, 0), 3);
  assert.equal(t.query(1, 1), 1);
});

test('array with duplicate values', () => {
  const t = createSparseTable([4, 4, 4, 4]);
  assert.equal(t.query(0, 3), 4);
  assert.equal(t.query(1, 2), 4);
});

test('monotonically increasing array for min', () => {
  const t = createSparseTable([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(t.query(2, 6), 3);
  assert.equal(t.query(0, 7), 1);
});

test('monotonically decreasing array for max', () => {
  const t = createSparseTable([8, 7, 6, 5, 4, 3, 2, 1], maxOf);
  assert.equal(t.query(2, 6), 6);
  assert.equal(t.query(0, 7), 8);
});

test('negative numbers', () => {
  const t = createSparseTable([-5, -1, -8, -3, -2]);
  assert.equal(t.query(0, 4), -8);
  assert.equal(t.query(0, 1), -5);
  assert.equal(t.query(2, 4), -8);
});

test('mixed positive and negative numbers', () => {
  const t = createSparseTable([-3, 4, -1, 7, -9, 2], maxOf);
  assert.equal(t.query(0, 5), 7);
  assert.equal(t.query(0, 2), 4);
  assert.equal(t.query(2, 4), 7);
});

test('non-numeric comparable values (strings with min)', () => {
  const t = createSparseTable(['cherry', 'apple', 'banana']);
  assert.equal(t.query(0, 2), 'apple');
  assert.equal(t.query(0, 1), 'apple');
  assert.equal(t.query(1, 2), 'apple');
});

test('out-of-bounds query returns undefined', () => {
  const t = createSparseTable([1, 2, 3]);
  assert.equal(t.query(-1, 2), undefined);
  assert.equal(t.query(0, 3), undefined);
  assert.equal(t.query(2, 1), undefined);
});

test('empty array produces a table that returns undefined', () => {
  const t = createSparseTable([]);
  assert.equal(t.size, 0);
  assert.equal(t.query(0, 0), undefined);
});

test('defaultCombine selects minimum', () => {
  assert.equal(defaultCombine(3, 7), 3);
  assert.equal(defaultCombine(7, 3), 3);
  assert.equal(defaultCombine(5, 5), 5);
});
