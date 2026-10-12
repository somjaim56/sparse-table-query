/**
 * Default combiner that selects the minimum of two values.
 *
 * We expose this so consumers can build a max-query table by passing a
 * simple arrow function, while still having a sensible default that matches
 * the most common use case (RMQ).
 */
export function defaultCombine(a, b) {
  return a <= b ? a : b;
}

/**
 * Build a sparse table over a static array for constant-time range queries.
 *
 * The sparse table precomputes the answer for every interval whose length is
 * a power of two. A range [l, r] is then answered by combining the two
 * largest precomputed intervals that cover it: one anchored at l, one ending
 * at r. Because the combiner must be idempotent (min, max, gcd, etc.), the
 * overlap between these two intervals is harmless.
 *
 * Trade-off: O(n log n) space and preprocessing time, O(1) per query. Only
 * sensible when the array is static and the combine function is idempotent.
 *
 * Edge cases handled:
 *   - Empty input array: query() always returns undefined.
 *   - Single-element ranges: query returns that element.
 */
export function createSparseTable(arr, combine) {
  const fn = combine ?? defaultCombine;
  const n = arr.length;
  const maxK = n > 0 ? Math.floor(Math.log2(n)) + 1 : 0;

  // st[k][i] = combine over [i, i + 2^k - 1].
  // Using a flat Int32Array-free structure: a plain array of arrays. We avoid
  // typed arrays because the input may contain any comparable values, not
  // just numbers.
  const st = new Array(maxK);

  if (n === 0) {
    return {
      query() {
        return undefined;
      },
      size: 0,
    };
  }

  // Base layer: intervals of length 1.
  st[0] = arr.slice();

  // Build layer by layer. Each entry st[k][i] combines two entries from
  // layer k-1: st[k-1][i] and st[k-1][i + half], where half = 2^(k-1).
  for (let k = 1; k < maxK; k++) {
    const half = 1 << (k - 1);
    const len = n - (1 << k) + 1;
    st[k] = new Array(len);
    for (let i = 0; i < len; i++) {
      st[k][i] = fn(st[k - 1][i], st[k - 1][i + half]);
    }
  }

  /**
   * Answer a range query over [left, right] inclusive.
   * Returns undefined for an out-of-bounds or empty range.
   */
  function query(left, right) {
    if (left < 0 || right >= n || left > right) {
      return undefined;
    }
    const length = right - left + 1;
    const k = Math.floor(Math.log2(length));
    // Two intervals of length 2^k: one starting at left, one ending at right.
    // They overlap, which is fine because the combiner is idempotent.
    return fn(st[k][left], st[k][right - (1 << k) + 1]);
  }

  return {
    query,
    size: n,
  };
}
