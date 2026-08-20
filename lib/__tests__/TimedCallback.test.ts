import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TimedCallback } from "../utils/TimedCallback";

describe("TimedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear all pending callbacks between tests
    Object.keys(TimedCallback.Calls).forEach((id) => {
      clearTimeout(TimedCallback.Calls[id].timeoutId);
      delete TimedCallback.Calls[id];
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create", () => {
    it("fires callback after timeout", () => {
      const cb = vi.fn();
      TimedCallback.create({ id: "test", timeout: 1000, callback: cb });

      expect(cb).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("removes itself after firing", () => {
      const cb = vi.fn();
      TimedCallback.create({ id: "test", timeout: 500, callback: cb });

      vi.advanceTimersByTime(500);
      expect(TimedCallback.Calls["test"]).toBeUndefined();
    });

    it("replaces existing callback with same id", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      TimedCallback.create({ id: "test", timeout: 1000, callback: cb1 });
      TimedCallback.create({ id: "test", timeout: 1000, callback: cb2 });

      vi.advanceTimersByTime(1000);
      expect(cb1).not.toHaveBeenCalled(); // replaced
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it("supports different ids simultaneously", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      TimedCallback.create({ id: "a", timeout: 100, callback: cb1 });
      TimedCallback.create({ id: "b", timeout: 200, callback: cb2 });

      vi.advanceTimersByTime(100);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });

  describe("alreadyPending", () => {
    it("returns true when callback is pending", () => {
      TimedCallback.create({ id: "test", timeout: 1000, callback: vi.fn() });
      expect(TimedCallback.alreadyPending("test")).toBe(true);
    });

    it("returns false when no callback pending", () => {
      expect(TimedCallback.alreadyPending("nonexistent")).toBe(false);
    });

    it("returns false after callback fires", () => {
      TimedCallback.create({ id: "test", timeout: 100, callback: vi.fn() });
      vi.advanceTimersByTime(100);
      expect(TimedCallback.alreadyPending("test")).toBe(false);
    });
  });

  describe("remove", () => {
    it("cancels pending callback", () => {
      const cb = vi.fn();
      TimedCallback.create({ id: "test", timeout: 1000, callback: cb });

      TimedCallback.remove("test");
      vi.advanceTimersByTime(1000);
      expect(cb).not.toHaveBeenCalled();
    });

    it("cleans up the entry", () => {
      TimedCallback.create({ id: "test", timeout: 1000, callback: vi.fn() });
      TimedCallback.remove("test");
      expect(TimedCallback.Calls["test"]).toBeUndefined();
    });

    it("does nothing if id does not exist", () => {
      // Should not throw
      expect(() => TimedCallback.remove("nonexistent")).not.toThrow();
    });
  });

  describe("restart", () => {
    it("resets the timer", () => {
      const cb = vi.fn();
      TimedCallback.create({ id: "test", timeout: 1000, callback: cb });

      vi.advanceTimersByTime(800);
      TimedCallback.restart({ id: "test", timeout: 1000 });

      vi.advanceTimersByTime(800);
      expect(cb).not.toHaveBeenCalled(); // should not have fired yet

      vi.advanceTimersByTime(200);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("calls onRepeated callback", () => {
      const onRepeated = vi.fn();
      TimedCallback.create({
        id: "test",
        timeout: 1000,
        callback: vi.fn(),
        onRepeated,
      });

      TimedCallback.restart({ id: "test", timeout: 1000 });
      expect(onRepeated).toHaveBeenCalledTimes(1);
    });
  });

  describe("onRepeated", () => {
    it("is stored and callable", () => {
      const onRepeated = vi.fn();
      TimedCallback.create({
        id: "test",
        timeout: 1000,
        callback: vi.fn(),
        onRepeated,
      });

      expect(TimedCallback.Calls["test"].onRepeated).toBe(onRepeated);
    });

    it("is optional", () => {
      TimedCallback.create({ id: "test", timeout: 1000, callback: vi.fn() });
      expect(TimedCallback.Calls["test"].onRepeated).toBeUndefined();

      // Restart should not throw even without onRepeated
      expect(() => TimedCallback.restart({ id: "test", timeout: 1000 })).not.toThrow();
    });
  });
});
