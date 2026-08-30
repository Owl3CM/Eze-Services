import { describe, it, expect, vi } from "vitest";
import { createHiveArray } from "../Hives/HiveArray";

interface Item {
  id: string;
  name: string;
}

function createTestArray() {
  return createHiveArray<Item>([
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
  ]);
}

describe("createHiveArray", () => {
  describe("initialization", () => {
    it("stores initial array", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      expect(hive.honey).toEqual([1, 2, 3]);
    });

    it("works with empty array", () => {
      const hive = createHiveArray<string>([]);
      expect(hive.honey).toEqual([]);
    });
  });

  describe("push", () => {
    it("appends item to end", () => {
      const hive = createHiveArray<number>([1, 2]);
      hive.push(3);
      expect(hive.honey).toEqual([1, 2, 3]);
    });

    it("notifies subscribers", () => {
      const hive = createHiveArray<number>([]);
      const cb = vi.fn();
      hive.subscribe(cb);
      cb.mockClear();

      hive.push(1);
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  describe("pop", () => {
    it("removes last item", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      hive.pop();
      expect(hive.honey).toEqual([1, 2]);
    });
  });

  describe("shift", () => {
    it("removes first item", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      hive.shift();
      expect(hive.honey).toEqual([2, 3]);
    });
  });

  describe("unshift", () => {
    it("prepends item to start", () => {
      const hive = createHiveArray<number>([2, 3]);
      hive.unshift(1);
      expect(hive.honey).toEqual([1, 2, 3]);
    });
  });

  describe("splice", () => {
    it("removes items and inserts new ones", () => {
      const hive = createHiveArray<number>([1, 2, 3, 4]);
      hive.splice(1, 2, 10, 20);
      expect(hive.honey).toEqual([1, 10, 20, 4]);
    });

    it("removes items without insertion", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      hive.splice(1, 1);
      expect(hive.honey).toEqual([1, 3]);
    });
  });

  describe("removeById", () => {
    it("removes item matching id", () => {
      const hive = createTestArray();
      hive.removeById("2");
      expect(hive.honey).toEqual([
        { id: "1", name: "Alice" },
        { id: "3", name: "Charlie" },
      ]);
    });

    it("does nothing if id not found", () => {
      const hive = createTestArray();
      hive.removeById("99");
      expect(hive.honey).toHaveLength(3);
    });
  });

  describe("removeByIndex", () => {
    it("removes item at index", () => {
      const hive = createHiveArray<number>([10, 20, 30]);
      hive.removeByIndex(1);
      expect(hive.honey).toEqual([10, 30]);
    });
  });

  describe("remove", () => {
    it("removes item at index (alias for removeByIndex)", () => {
      const hive = createHiveArray<number>([10, 20, 30]);
      hive.remove(0);
      expect(hive.honey).toEqual([20, 30]);
    });
  });

  describe("append", () => {
    it("appends multiple items", () => {
      const hive = createHiveArray<number>([1]);
      hive.append([2, 3, 4]);
      expect(hive.honey).toEqual([1, 2, 3, 4]);
    });
  });

  describe("update", () => {
    it("creates a new array reference (triggers re-render)", () => {
      const items = [1, 2, 3];
      const hive = createHiveArray<number>(items);
      const before = hive.honey;
      hive.update();
      expect(hive.honey).toEqual(before);
      expect(hive.honey).not.toBe(before); // new reference
    });
  });

  describe("updateByIndex", () => {
    it("replaces item at index", () => {
      const hive = createTestArray();
      hive.updateByIndex(1, { id: "2", name: "Bobby" });
      expect(hive.honey[1]).toEqual({ id: "2", name: "Bobby" });
    });
  });

  describe("updateById", () => {
    it("merges partial data into matching item", () => {
      const hive = createTestArray();
      hive.updateById("1", { name: "Alicia" });
      expect(hive.honey[0]).toEqual({ id: "1", name: "Alicia" });
    });

    it("does not affect other items", () => {
      const hive = createTestArray();
      hive.updateById("1", { name: "Alicia" });
      expect(hive.honey[1]).toEqual({ id: "2", name: "Bob" });
    });
  });

  describe("getById", () => {
    it("returns item matching id", () => {
      const hive = createTestArray();
      expect(hive.getById("2")).toEqual({ id: "2", name: "Bob" });
    });

    it("returns undefined if not found", () => {
      const hive = createTestArray();
      expect(hive.getById("99")).toBeUndefined();
    });
  });

  describe("inherits hive behavior", () => {
    it("setHoney replaces entire array", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      hive.setHoney([10, 20]);
      expect(hive.honey).toEqual([10, 20]);
    });

    it("reset returns to initial array", () => {
      const hive = createHiveArray<number>([1, 2, 3]);
      hive.push(4);
      hive.push(5);
      hive.reset();
      expect(hive.honey).toEqual([1, 2, 3]);
    });
  });
});
