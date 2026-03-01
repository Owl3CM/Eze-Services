import { describe, it, expect, vi } from "vitest";
import { createHive } from "../Hives/Hive";

describe("createHive", () => {
  describe("initialization", () => {
    it("stores initial value as honey", () => {
      const hive = createHive(42);
      expect(hive.honey).toBe(42);
    });

    it("stores initial value reference", () => {
      const hive = createHive("hello");
      expect(hive.initialValue).toBe("hello");
    });

    it("works with object values", () => {
      const obj = { name: "test", count: 0 };
      const hive = createHive(obj);
      expect(hive.honey).toBe(obj);
    });

    it("works with null", () => {
      const hive = createHive(null);
      expect(hive.honey).toBeNull();
    });

    it("works with array", () => {
      const hive = createHive([1, 2, 3]);
      expect(hive.honey).toEqual([1, 2, 3]);
    });
  });

  describe("setHoney", () => {
    it("updates the value", () => {
      const hive = createHive(0);
      hive.setHoney(10);
      expect(hive.honey).toBe(10);
    });

    it("skips update when value is identical (reference equality)", () => {
      const cb = vi.fn();
      const hive = createHive(5);
      hive.subscribe(cb);
      cb.mockClear(); // clear the initial call from subscribe

      hive.setHoney(5);
      expect(cb).not.toHaveBeenCalled();
    });

    it("accepts a function updater", () => {
      const hive = createHive(10);
      hive.setHoney((prev: number) => prev + 5);
      expect(hive.honey).toBe(15);
    });

    it("function updater receives current value", () => {
      const hive = createHive({ count: 1 });
      hive.setHoney((prev: { count: number }) => ({ count: prev.count + 1 }));
      expect(hive.honey).toEqual({ count: 2 });
    });
  });

  describe("silentSetHoney", () => {
    it("updates value without notifying subscribers", () => {
      const cb = vi.fn();
      const hive = createHive(0);
      hive.subscribe(cb);
      cb.mockClear();

      hive.silentSetHoney(99);
      expect(hive.honey).toBe(99);
      expect(cb).not.toHaveBeenCalled();
    });

    it("accepts function updater", () => {
      const hive = createHive(10);
      hive.silentSetHoney((prev: number) => prev * 2);
      expect(hive.honey).toBe(20);
    });
  });

  describe("subscribe", () => {
    it("notifies subscribers on setHoney", () => {
      const hive = createHive(0);
      const cb = vi.fn();
      hive.subscribe(cb);
      cb.mockClear();

      hive.setHoney(1);
      expect(cb).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("calls subscriber immediately if value differs from initial", () => {
      const hive = createHive(0);
      hive.setHoney(5);

      const cb = vi.fn();
      hive.subscribe(cb);
      // Should be called immediately with current value
      expect(cb).toHaveBeenCalledWith(5);
    });

    it("does NOT call subscriber immediately when value equals initial", () => {
      const hive = createHive(0);
      const cb = vi.fn();
      hive.subscribe(cb);
      // Value is still initial, should not call
      // BUT HiveBase calls pollinate() at end of constructor when no storeKey
      // so it WILL be called. Let me check...
      // Actually looking at HiveBase: `else pollinate()` at the end, which means
      // it calls pollinate even for initial value. But subscribe checks:
      // `if (baseHive.honey !== initialValue) callback(baseHive.honey);`
      // So it won't call if honey === initialValue at subscribe time.
      // However the hive pollinate() in constructor fires before any subscribe,
      // so the subscribe check is what matters.
      expect(cb).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const hive = createHive(0);
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      hive.subscribe(cb1);
      hive.subscribe(cb2);
      cb1.mockClear();
      cb2.mockClear();

      hive.setHoney(1);
      expect(cb1).toHaveBeenCalledWith(1);
      expect(cb2).toHaveBeenCalledWith(1);
    });

    it("returns unsubscribe function", () => {
      const hive = createHive(0);
      const cb = vi.fn();
      const unsub = hive.subscribe(cb);
      cb.mockClear();

      unsub();
      hive.setHoney(1);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("returns to initial value", () => {
      const hive = createHive(0);
      hive.setHoney(100);
      expect(hive.honey).toBe(100);

      hive.reset();
      expect(hive.honey).toBe(0);
    });

    it("notifies subscribers on reset", () => {
      const hive = createHive("start");
      hive.setHoney("changed");

      const cb = vi.fn();
      hive.subscribe(cb);
      cb.mockClear();

      hive.reset();
      expect(cb).toHaveBeenCalledWith("start");
    });
  });

  describe("_subscribers", () => {
    it("returns count of active subscribers", () => {
      const hive = createHive(0);
      expect(hive._subscribers()).toBe(0);

      const unsub1 = hive.subscribe(vi.fn());
      expect(hive._subscribers()).toBe(1);

      hive.subscribe(vi.fn());
      expect(hive._subscribers()).toBe(2);

      unsub1();
      expect(hive._subscribers()).toBe(1);
    });
  });
});
