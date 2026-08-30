import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoaderSlice } from "../Slices/Loader/LoaderSlice";
import type { LoaderDependencies } from "../Slices/Loader/Types";
import { noopHandler } from "../Slices/OperationHandler";

// ─── Test Helpers ───────────────────────────────────────────────────────────

/** Create a mock QueryAPI with listenToQuery that fires manually. */
function createMockQueryCtx() {
  let listener: ((q: any) => void) | null = null;
  return {
    query: {
      listenToQuery: (cb: (q: any) => void) => {
        listener = cb;
        return () => {
          listener = null;
        };
      },
    },
    fireQuery: (q: any) => {
      listener?.(q);
    },
  };
}

/** Track OperationHandler calls. */
function createSpyHandler() {
  const handler = {
    loading: vi.fn(),
    error: vi.fn(),
    idle: vi.fn(),
    success: vi.fn(),
  };
  return { handler, factory: () => handler };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("LoaderSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Basic Load ────────────────────────────────────────────────────────────

  it("loads data and stores result in loaderHive", async () => {
    const loader = vi.fn().mockResolvedValue({ name: "test" });
    const { handler, factory } = createSpyHandler();

    const slice = LoaderSlice({ loader, operationHandler: factory });
    const { loader: api } = slice({} as LoaderDependencies);

    // Immediate load fires on construction (no ctx.query)
    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    expect(api.loaderHive.honey).toEqual({ name: "test" });
    expect(handler.loading).toHaveBeenCalled();
  });

  it("applies format function to transform response", async () => {
    const loader = vi.fn().mockResolvedValue({ raw: true });
    const format = vi.fn((data: any) => ({ formatted: true, from: data }));
    const { factory } = createSpyHandler();

    const slice = LoaderSlice({ loader, format, operationHandler: factory });
    const { loader: api } = slice({} as LoaderDependencies);

    await vi.waitFor(() => expect(api.loaderHive.honey).toBeDefined());
    expect(api.loaderHive.honey).toEqual({ formatted: true, from: { raw: true } });
    expect(format).toHaveBeenCalledWith({ raw: true });
  });

  // ── Reload ────────────────────────────────────────────────────────────────

  it("reload calls load with clearCache = true", async () => {
    const loader = vi.fn().mockResolvedValue("data");
    const { factory } = createSpyHandler();

    const slice = LoaderSlice({ loader, operationHandler: factory });
    const { loader: api } = slice({} as LoaderDependencies);

    await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1));

    await api.reload({ filter: "x" });
    expect(loader).toHaveBeenCalledTimes(2);
    // Second call should have clearCache = true
    expect(loader.mock.calls[1]).toEqual([{ filter: "x" }, true]);
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it("calls handler.error on failure and re-throws", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("fail"));
    const { handler, factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    // Use query context so auto-load does NOT fire on construction
    const slice = LoaderSlice({ loader, operationHandler: factory });
    const { loader: api } = slice(mockQuery as unknown as LoaderDependencies);

    // Manually call load — catches the re-throw
    await expect(api.load()).rejects.toThrow("fail");

    expect(handler.loading).toHaveBeenCalled();
    expect(handler.error).toHaveBeenCalledWith({ message: "Error: fail" });
  });

  // ── Operation Handler Lifecycle ───────────────────────────────────────────

  it("handler lifecycle: loading → idle on success", async () => {
    const loader = vi.fn().mockResolvedValue("ok");
    const { handler, factory } = createSpyHandler();

    const slice = LoaderSlice({ loader, operationHandler: factory });
    slice({} as LoaderDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    const loadingOrder = handler.loading.mock.invocationCallOrder[0];
    const idleOrder = handler.idle.mock.invocationCallOrder[0];
    expect(loadingOrder).toBeLessThan(idleOrder);
  });

  // ── Query Subscription ────────────────────────────────────────────────────

  it("subscribes to query and loads on change", async () => {
    const loader = vi.fn().mockResolvedValue("data");
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = LoaderSlice({ loader, operationHandler: factory });
    slice(mockQuery as unknown as LoaderDependencies);

    // Should NOT auto-load without a query fire — it subscribes first
    // But the subscription callback fires when query changes
    mockQuery.fireQuery({ search: "hello" });
    await vi.waitFor(() => expect(loader).toHaveBeenCalled());
    expect(loader.mock.calls[0][0]).toEqual({ search: "hello" });
  });

  it("shouldLoadOnQueryChange can prevent loading", async () => {
    const loader = vi.fn().mockResolvedValue("data");
    const shouldLoad = vi.fn().mockReturnValue(false);
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = LoaderSlice({ loader, shouldLoadOnQueryChange: shouldLoad, operationHandler: factory });
    slice(mockQuery as unknown as LoaderDependencies);

    mockQuery.fireQuery({ search: "" });

    await vi.waitFor(() => expect(shouldLoad).toHaveBeenCalled());
    expect(shouldLoad).toHaveBeenCalledWith({ search: "" }, expect.objectContaining({ clear: expect.any(Function) }));
    expect(loader).not.toHaveBeenCalled();
  });

  it("onError callback fires on loader failure", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("boom"));
    const onError = vi.fn();
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = LoaderSlice({ loader, onError, operationHandler: factory });
    const { loader: api } = slice(mockQuery as unknown as LoaderDependencies);

    await expect(api.load()).rejects.toThrow("boom");
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── Clear ─────────────────────────────────────────────────────────────────

  it("clear via shouldLoadOnQueryChange controls resets loaderHive", async () => {
    const loader = vi.fn().mockResolvedValue("data");
    let capturedClear: (() => void) | undefined;
    const shouldLoad = vi.fn((q: any, controls: { clear: () => void }) => {
      capturedClear = controls.clear;
      return true;
    });
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = LoaderSlice({ loader, shouldLoadOnQueryChange: shouldLoad, operationHandler: factory });
    const { loader: api } = slice(mockQuery as unknown as LoaderDependencies);

    // Fire query to trigger load and capture clear
    mockQuery.fireQuery({ search: "test" });
    await vi.waitFor(() => expect(api.loaderHive.honey).toBe("data"));

    // Now call the captured clear
    expect(capturedClear).toBeDefined();
    capturedClear!();
    expect(api.loaderHive.honey).toBeUndefined();
  });

  // ── isLoading ─────────────────────────────────────────────────────────────

  it("isLoading returns false when not loading", async () => {
    const loader = vi.fn().mockResolvedValue("done");
    const { factory } = createSpyHandler();

    const slice = LoaderSlice({ loader, operationHandler: factory });
    const { loader: api } = slice({} as LoaderDependencies);

    await vi.waitFor(() => expect(api.loaderHive.honey).toBe("done"));
    expect(api.isLoading()).toBe(false);
  });

  // ── Operation Name ────────────────────────────────────────────────────────

  it("exposes the configured operation name", () => {
    const loader = vi.fn().mockResolvedValue("data");

    const slice = LoaderSlice({ loader, operation: "fetch-users", operationHandler: () => noopHandler });
    const { loader: api } = slice({} as LoaderDependencies);

    expect(api.operation).toBe("fetch-users");
  });
});
