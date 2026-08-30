import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import type { IStatusKit, OperationState } from "../Slices/Status/Types";

// ─── Test Helpers ───────────────────────────────────────────────────────────

/** Minimal StatusKit for testing — 3 types with distinct priorities. */
const createTestKit = () =>
  ({
    loading: { priority: 1, props: {} as { variant?: string }, component: () => null },
    error: { priority: 2, props: {} as { message?: string }, component: () => null },
    success: { priority: 3, props: {} as { title?: string }, component: () => null },
  }) satisfies IStatusKit;

type TestKit = ReturnType<typeof createTestKit>;

/** Build a StatusSlice and return its API. */
function buildStatus(config?: { staleTimeout?: number; onStaleOperation?: (op: OperationState<TestKit>) => void }) {
  const kit = createTestKit();
  const slice = StatusSlice<TestKit>({ statusKit: kit, ...config });
  const result = slice({});
  return result.status;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("StatusSlice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Chain Builder ─────────────────────────────────────────────────────────

  describe("chain builder", () => {
    it("operation() returns a chain with all statusKit methods + idle", () => {
      const status = buildStatus();
      const chain = status.operation("table");

      expect(chain).toHaveProperty("loading");
      expect(chain).toHaveProperty("error");
      expect(chain).toHaveProperty("success");
      expect(chain).toHaveProperty("idle");
      expect(typeof chain.loading).toBe("function");
      expect(typeof chain.idle).toBe("function");
    });

    it("caches the chain — same operation name returns same object", () => {
      const status = buildStatus();
      const a = status.operation("fetch");
      const b = status.operation("fetch");
      expect(a).toBe(b);
    });

    it("ready() maps to the DEFAULT operation", () => {
      const status = buildStatus();
      status.ready().loading({});

      expect(status.isActive("DEFAULT" as any)).toBe(true);
    });
  });

  // ── Set / Remove Operations ───────────────────────────────────────────────

  describe("set and remove operations", () => {
    it("sets an operation in the hive", () => {
      const status = buildStatus();
      status.operation("table").loading({ variant: "skeleton" });

      const state = status.getState("table");
      expect(state).not.toBeNull();
      expect(state!.statusType).toBe("loading");
      expect(state!.props).toEqual({ variant: "skeleton" });
      expect(state!.priority).toBe(1);
      expect(state!.operation).toBe("table");
      expect(state!.startedAt).toBeTypeOf("number");
    });

    it("removes an operation via idle()", () => {
      const status = buildStatus();
      status.operation("table").loading({});
      expect(status.isActive("table")).toBe(true);

      status.operation("table").idle();
      expect(status.isActive("table")).toBe(false);
      expect(status.getState("table")).toBeNull();
    });

    it("supports multiple concurrent operations", () => {
      const status = buildStatus();
      status.operation("table").loading({});
      status.operation("save").error({ message: "fail" });

      expect(status.isActive("table")).toBe(true);
      expect(status.isActive("save")).toBe(true);
      expect(status.getActiveOperations()).toHaveLength(2);
    });

    it("overwrites existing operation when set again", () => {
      const status = buildStatus();
      status.operation("table").loading({});
      status.operation("table").error({ message: "oops" });

      const state = status.getState("table");
      expect(state!.statusType).toBe("error");
      expect(status.getActiveOperations()).toHaveLength(1);
    });
  });

  // ── Priority Resolution ───────────────────────────────────────────────────

  describe("priority resolution", () => {
    it("getPrimary() returns the highest-priority (lowest number) operation", () => {
      const status = buildStatus();
      status.operation("table").success({ title: "Done" }); // priority 3
      status.operation("save").loading({}); // priority 1

      const primary = status.getPrimary();
      expect(primary).not.toBeNull();
      expect(primary!.operation).toBe("save");
      expect(primary!.statusType).toBe("loading");
    });

    it("getPrimary() returns null when no operations are active", () => {
      const status = buildStatus();
      expect(status.getPrimary()).toBeNull();
    });

    it("getPrimary() filters by operation names", () => {
      const status = buildStatus();
      status.operation("table").loading({});
      status.operation("save").error({});

      const primary = status.getPrimary(["save"]);
      expect(primary!.operation).toBe("save");
    });

    it("getPrimary() filters by status types", () => {
      const status = buildStatus();
      status.operation("table").loading({});
      status.operation("save").success({});

      const primary = status.getPrimary(undefined, ["success"]);
      expect(primary!.statusType).toBe("success");
    });
  });

  // ── Query API ─────────────────────────────────────────────────────────────

  describe("query API", () => {
    it("isAnyActive() checks multiple operation names", () => {
      const status = buildStatus();
      status.operation("table").loading({});

      expect(status.isAnyActive(["table", "save"])).toBe(true);
      expect(status.isAnyActive(["save", "delete"])).toBe(false);
    });

    it("getActiveOperations() returns all active operation names", () => {
      const status = buildStatus();
      status.operation("a").loading({});
      status.operation("b").error({});

      const ops = status.getActiveOperations();
      expect(ops).toContain("a");
      expect(ops).toContain("b");
      expect(ops).toHaveLength(2);
    });

    it("getComponent() returns the component from the statusKit", () => {
      const status = buildStatus();
      const comp = status.getComponent("loading");
      expect(typeof comp).toBe("function");
    });

    it("getComponent() returns a noop for unknown type", () => {
      const status = buildStatus();
      const comp = status.getComponent("nonexistent" as any);
      expect(typeof comp).toBe("function");
    });
  });

  // ── Timeouts ──────────────────────────────────────────────────────────────

  describe("timeouts", () => {
    it("auto-removes operation after options.timeout", () => {
      const status = buildStatus();
      status.operation("toast").success({ title: "Saved" }, { timeout: 3000 });

      expect(status.isActive("toast")).toBe(true);

      vi.advanceTimersByTime(3000);
      expect(status.isActive("toast")).toBe(false);
    });

    it("staleTimeout cleans up operations that linger", () => {
      const onStale = vi.fn();
      const status = buildStatus({ staleTimeout: 5000, onStaleOperation: onStale });

      status.operation("slow").loading({});
      expect(status.isActive("slow")).toBe(true);

      vi.advanceTimersByTime(5000);
      expect(status.isActive("slow")).toBe(false);
      expect(onStale).toHaveBeenCalledOnce();
      expect(onStale.mock.calls[0][0].operation).toBe("slow");
    });

    it("explicit timeout takes precedence over staleTimeout", () => {
      const onStale = vi.fn();
      const status = buildStatus({ staleTimeout: 5000, onStaleOperation: onStale });

      status.operation("quick").success({}, { timeout: 1000 });

      vi.advanceTimersByTime(1000);
      expect(status.isActive("quick")).toBe(false);
      // onStale should NOT be called — explicit timeout is not a stale cleanup
      expect(onStale).not.toHaveBeenCalled();
    });

    it("re-setting an operation resets the stale timer", () => {
      const status = buildStatus({ staleTimeout: 5000 });

      status.operation("op").loading({});
      vi.advanceTimersByTime(3000); // 3s in — not yet stale
      expect(status.isActive("op")).toBe(true);

      // Re-set resets the timer
      status.operation("op").error({});
      vi.advanceTimersByTime(3000); // 3s more — only 3s since re-set
      expect(status.isActive("op")).toBe(true);

      vi.advanceTimersByTime(2000); // now 5s since re-set
      expect(status.isActive("op")).toBe(false);
    });
  });

  // ── Hive Subscription ────────────────────────────────────────────────────

  describe("hive", () => {
    it("exposes a reactive hive for component subscription", () => {
      const status = buildStatus();
      expect(status.hive).toBeDefined();
      expect(status.hive.honey).toBeInstanceOf(Map);
      expect(status.hive.honey.size).toBe(0);

      status.operation("x").loading({});
      expect(status.hive.honey.size).toBe(1);
    });
  });
});
