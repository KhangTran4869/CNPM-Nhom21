import test from "node:test";
import assert from "node:assert/strict";
import { rangesOverlap } from "../src/utils/time.js";

test("rangesOverlap returns true when periods intersect", () => {
  assert.equal(rangesOverlap(1, 3, 3, 5), true);
  assert.equal(rangesOverlap(2, 6, 4, 7), true);
});

test("rangesOverlap returns false when periods do not intersect", () => {
  assert.equal(rangesOverlap(1, 2, 3, 5), false);
  assert.equal(rangesOverlap(6, 8, 2, 5), false);
});
