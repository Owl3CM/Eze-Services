import { describe, it, expect } from "vitest";
import { CheckSimilarity } from "../Hives/HiveUtils";

describe("CheckSimilarity", () => {
  describe("primitives", () => {
    it("same numbers are similar", () => {
      expect(CheckSimilarity(1, 1)).toBe(true);
    });

    it("different numbers are not similar", () => {
      expect(CheckSimilarity(1, 2)).toBe(false);
    });

    it("same strings are similar", () => {
      expect(CheckSimilarity("hello", "hello")).toBe(true);
    });

    it("different strings are not similar", () => {
      expect(CheckSimilarity("hello", "world")).toBe(false);
    });

    it("same booleans are similar", () => {
      expect(CheckSimilarity(true, true)).toBe(true);
    });

    it("different booleans are not similar", () => {
      expect(CheckSimilarity(true, false)).toBe(false);
    });

    it("type mismatch returns false", () => {
      expect(CheckSimilarity(1, "1")).toBe(false);
      expect(CheckSimilarity(true, 1)).toBe(false);
    });
  });

  describe("null / undefined", () => {
    it("both null is similar", () => {
      expect(CheckSimilarity(null, null)).toBe(true);
    });

    it("null vs object is not similar", () => {
      expect(CheckSimilarity(null, {})).toBe(false);
    });

    it("object vs null is not similar", () => {
      expect(CheckSimilarity({}, null)).toBe(false);
    });

    it("both undefined is similar", () => {
      expect(CheckSimilarity(undefined, undefined)).toBe(true);
    });
  });

  describe("arrays", () => {
    it("same arrays are similar", () => {
      expect(CheckSimilarity([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it("different length arrays are not similar", () => {
      expect(CheckSimilarity([1, 2], [1, 2, 3])).toBe(false);
    });

    it("different values are not similar", () => {
      expect(CheckSimilarity([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it("empty arrays are similar", () => {
      expect(CheckSimilarity([], [])).toBe(true);
    });

    it("nested arrays are compared deeply", () => {
      expect(CheckSimilarity([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
      expect(CheckSimilarity([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
    });
  });

  describe("objects", () => {
    it("same objects are similar", () => {
      expect(CheckSimilarity({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it("different values are not similar", () => {
      expect(CheckSimilarity({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("different key count is not similar", () => {
      expect(CheckSimilarity({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it("empty objects are similar", () => {
      expect(CheckSimilarity({}, {})).toBe(true);
    });
  });

  describe("deeply nested structures", () => {
    it("complex nested match", () => {
      const a = { users: [{ id: 1, name: "Alice" }], count: 1 };
      const b = { users: [{ id: 1, name: "Alice" }], count: 1 };
      expect(CheckSimilarity(a, b)).toBe(true);
    });

    it("complex nested mismatch", () => {
      const a = { users: [{ id: 1, name: "Alice" }], count: 1 };
      const b = { users: [{ id: 1, name: "Bob" }], count: 1 };
      expect(CheckSimilarity(a, b)).toBe(false);
    });
  });

  describe("mixed types", () => {
    it("array vs object with matching numeric keys is treated as similar (known behavior)", () => {
      // CheckSimilarity doesn't check Array.isArray on both sides simultaneously
      // so [1] is treated the same as { 0: 1, length: 1 } won't match,
      // but [1] vs { 0: 1 } will match since both fall into the "object keys" branch
      expect(CheckSimilarity([1], { 0: 1 })).toBe(true);
    });
  });
});
