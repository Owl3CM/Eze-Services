import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowSlice } from "../Slices/Flow/FlowSlice";
import type { FlowSliceConfig, IStepDefinition } from "../Slices/Flow/Types";

// ─── Test Helpers ───────────────────────────────────────────────────────────

type TestFactory = { form?: any; status?: any };
type TestStep = "info" | "confirm" | "done" | "extra";
type TestFlow = "main" | "short" | "alt";

const noop = () => null;

/** Build step definitions. */
function createStepDef(overrides?: Partial<IStepDefinition<TestFactory>>): IStepDefinition<TestFactory> {
  return { label: "Step", component: noop, ...overrides };
}

/** Build a FlowSlice with standard 3-step flow. */
function buildFlow(overrides?: Partial<FlowSliceConfig<TestFactory, TestStep, TestFlow>>) {
  const config: FlowSliceConfig<TestFactory, TestStep, TestFlow> = {
    registry: {
      info: createStepDef({ label: "Info" }),
      confirm: createStepDef({ label: "Confirm" }),
      done: createStepDef({ label: "Done" }),
      extra: createStepDef({ label: "Extra" }),
    },
    flows: {
      main: ["info", "confirm", "done"],
      short: ["info", "done"],
      alt: ["confirm", "extra"],
    },
    defaultFlow: "main",
    ...overrides,
  };

  const slice = FlowSlice<TestFactory, TestStep, TestFlow>(config);
  const ctx: TestFactory = {};
  const result = slice(ctx);
  return { flow: result.flow, ctx };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("FlowSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial State ─────────────────────────────────────────────────────────

  it("initializes with defaultFlow and first step", () => {
    const { flow } = buildFlow();
    const state = flow.hive.honey;

    expect(state.currentFlow).toBe("main");
    expect(state.currentStep).toBe("info");
    expect(state.sequence).toEqual(["info", "confirm", "done"]);
    expect(state.history).toEqual([]);
    expect(state.direction).toBe("idle");
    expect(state.status).toBe("idle");
  });

  // ── Navigation: next() ────────────────────────────────────────────────────

  it("next() advances to the next step in sequence", async () => {
    const { flow } = buildFlow();

    await flow.next();
    expect(flow.hive.honey.currentStep).toBe("confirm");
    expect(flow.hive.honey.direction).toBe("forward");
    expect(flow.hive.honey.history).toEqual(["info"]);
  });

  it("next() at last step calls onFlowComplete", async () => {
    const onFlowComplete = vi.fn();
    const { flow } = buildFlow({ onFlowComplete });

    await flow.next(); // info → confirm
    await flow.next(); // confirm → done
    await flow.next(); // done → complete

    expect(onFlowComplete).toHaveBeenCalledOnce();
    expect(onFlowComplete).toHaveBeenCalledWith("main", expect.any(Object));
    // Should still be on "done" — no step change
    expect(flow.hive.honey.currentStep).toBe("done");
  });

  it("next() calls onStepChange callback", async () => {
    const onStepChange = vi.fn();
    const { flow } = buildFlow({ onStepChange });

    await flow.next();
    expect(onStepChange).toHaveBeenCalledWith("info", "confirm", expect.any(Object));
  });

  // ── Navigation: next() with onNext guard ──────────────────────────────────

  it("next() blocks when onNext returns false", async () => {
    const { flow } = buildFlow({
      registry: {
        info: createStepDef({ onNext: async () => false }),
        confirm: createStepDef(),
        done: createStepDef(),
        extra: createStepDef(),
      },
    });

    await flow.next();
    // Should NOT advance
    expect(flow.hive.honey.currentStep).toBe("info");
    expect(flow.hive.honey.status).toBe("idle");
  });

  it("next() allows when onNext returns true/void", async () => {
    const { flow } = buildFlow({
      registry: {
        info: createStepDef({ onNext: async () => {} }),
        confirm: createStepDef(),
        done: createStepDef(),
        extra: createStepDef(),
      },
    });

    await flow.next();
    expect(flow.hive.honey.currentStep).toBe("confirm");
  });

  it("next() sets error status when onNext throws", async () => {
    const { flow } = buildFlow({
      registry: {
        info: createStepDef({
          onNext: async () => {
            throw new Error("Validation failed");
          },
        }),
        confirm: createStepDef(),
        done: createStepDef(),
        extra: createStepDef(),
      },
    });

    await flow.next();
    expect(flow.hive.honey.currentStep).toBe("info");
    expect(flow.hive.honey.status).toBe("error");
    expect(flow.hive.honey.error).toBe("Error: Validation failed");
  });

  it("next() sets transitioning status during onNext", async () => {
    let capturedStatus: string | undefined;
    const { flow } = buildFlow({
      registry: {
        info: createStepDef({
          onNext: async (factory) => {
            capturedStatus = flow.hive.honey.status;
          },
        }),
        confirm: createStepDef(),
        done: createStepDef(),
        extra: createStepDef(),
      },
    });

    await flow.next();
    expect(capturedStatus).toBe("transitioning");
  });

  // ── Navigation: back() ────────────────────────────────────────────────────

  it("back() returns to previous step from history", async () => {
    const { flow } = buildFlow();

    await flow.next(); // info → confirm
    expect(flow.hive.honey.currentStep).toBe("confirm");

    await flow.back();
    expect(flow.hive.honey.currentStep).toBe("info");
    expect(flow.hive.honey.direction).toBe("backward");
    expect(flow.hive.honey.history).toEqual([]);
  });

  it("back() does nothing at first step (empty history)", async () => {
    const { flow } = buildFlow();

    await flow.back();
    expect(flow.hive.honey.currentStep).toBe("info");
  });

  // ── Navigation: goTo() ────────────────────────────────────────────────────

  it("goTo() jumps directly to a step", async () => {
    const { flow } = buildFlow();

    await flow.goTo("done");
    expect(flow.hive.honey.currentStep).toBe("done");
    expect(flow.hive.honey.history).toEqual(["info"]);
  });

  it("goTo() rejects unknown steps", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { flow } = buildFlow();

    await flow.goTo("nonexistent" as any);
    expect(flow.hive.honey.currentStep).toBe("info"); // unchanged
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("goTo() calls onEnter on the target step", async () => {
    const onEnter = vi.fn();
    const { flow } = buildFlow({
      registry: {
        info: createStepDef(),
        confirm: createStepDef({ onEnter }),
        done: createStepDef(),
        extra: createStepDef(),
      },
    });

    await flow.goTo("confirm");
    expect(onEnter).toHaveBeenCalledWith(expect.any(Object));
  });

  // ── Flow Switching ────────────────────────────────────────────────────────

  it("switchFlow() changes to a different flow", () => {
    const { flow } = buildFlow();

    flow.switchFlow("short");
    const state = flow.hive.honey;

    expect(state.currentFlow).toBe("short");
    expect(state.currentStep).toBe("info");
    expect(state.sequence).toEqual(["info", "done"]);
    expect(state.history).toEqual([]);
    expect(state.direction).toBe("idle");
  });

  it("switchFlow() with startAtStep", () => {
    const { flow } = buildFlow();

    flow.switchFlow("main", "confirm");
    expect(flow.hive.honey.currentStep).toBe("confirm");
  });

  it("switchFlow() rejects unknown flow", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { flow } = buildFlow();

    flow.switchFlow("nonexistent" as any);
    expect(flow.hive.honey.currentFlow).toBe("main"); // unchanged
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  // ── Query API ─────────────────────────────────────────────────────────────

  it("isFirstStep / isLastStep return correct values", async () => {
    const { flow } = buildFlow();

    expect(flow.isFirstStep()).toBe(true);
    expect(flow.isLastStep()).toBe(false);

    await flow.next(); // → confirm
    expect(flow.isFirstStep()).toBe(false);
    expect(flow.isLastStep()).toBe(false);

    await flow.next(); // → done
    expect(flow.isFirstStep()).toBe(false);
    expect(flow.isLastStep()).toBe(true);
  });

  it("getDefinition returns step definition", () => {
    const { flow } = buildFlow();
    const def = flow.getDefinition("info");

    expect(def).toBeDefined();
    expect(def!.label).toBe("Info");
  });

  // ── Dynamic Management ────────────────────────────────────────────────────

  it("addStep adds a new step to the registry", () => {
    const { flow } = buildFlow();

    flow.addStep("extra", createStepDef({ label: "Extra Step" }));
    const def = flow.getDefinition("extra");
    expect(def!.label).toBe("Extra Step");
  });

  it("defineFlow creates a new flow sequence", () => {
    const { flow } = buildFlow();

    flow.defineFlow("alt", ["done", "info"]);
    flow.switchFlow("alt");
    expect(flow.hive.honey.sequence).toEqual(["done", "info"]);
    expect(flow.hive.honey.currentStep).toBe("done");
  });
});
