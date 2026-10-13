# sparse-table-query

Preprocesses a static array for constant-time range minimum or maximum queries using a sparse table.

## Usage

```js
import { createSparseTable } from 'sparse-table-query';

// Range minimum query (default)
const minTable = createSparseTable([5, 2, 4, 7, 1, 8, 3, 6]);
minTable.query(0, 5);  // 1
minTable.query(2, 3);  // 4

// Range maximum query — pass a combiner
const maxTable = createSparseTable([5, 2, 4, 7, 1, 8, 3, 6], (a, b) => a >= b ? a : b);
maxTable.query(0, 7);  // 8
```

The combiner can be any idempotent, associative function (min, max, gcd). Non-idempotent functions like sum or product will give wrong answers because the query relies on overlapping intervals.

## Why

Range queries on a static array are a common need. A naive scan is O(n) per query; a segment tree is O(log n) per query with O(n) space. A sparse table gives O(1) queries at the cost of O(n log n) space and preprocessing. This is the right choice when the array never changes and you are doing many queries.

## Edge cases

- An empty input array produces a table whose `query()` always returns `undefined`.
- Out-of-bounds or inverted ranges (`left > right`) return `undefined` rather than throwing.
- The array can hold any comparable values, not just numbers — strings, for example, work with the default min combiner.

## Exports

- `createSparseTable(arr, combine?)` — returns `{ query(left, right), size }`.
- `defaultCombine(a, b)` — the default min combiner, exported so you can compose or inspect it.
