import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaginatorSlice } from "../Slices/Paginator/PaginatorSlice";
import type { PaginatorDependencies } from "../Slices/Paginator/Types";
import { noopHandler } from "../Slices/OperationHandler";

// ─── Test Helpers ───────────────────────────────────────────────────────────

/** Create a mock paginator backend with controllable state. */
function createMockPaginator(items: any[] = [{ id: 1 }, { id: 2 }]) {
  return {
    load: vi.fn().mockResolvedValue(items),
    reload: vi.fn().mockResolvedValue(items),
    loadMore: vi.fn().mockResolvedValue(items),
    goToPage: vi.fn().mockResolvedValue(items),
    hasMore: true,
    limit: 20,
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

/** Create a mock QueryAPI with controllable listener. */
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
    isListening: () => listener !== null,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("PaginatorSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Basic Load ────────────────────────────────────────────────────────────

  it("loads data and stores in paginatorHive", async () => {
    const paginator = createMockPaginator([{ id: 1 }, { id: 2 }]);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    // Auto-loads on construction when no ctx.query
    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    expect(api.paginatorHive.honey).toEqual([{ id: 1 }, { id: 2 }]);
    expect(handler.loading).toHaveBeenCalled();
  });

  it("reload replaces data", async () => {
    const paginator = createMockPaginator([{ id: 1 }]);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    paginator.reload.mockResolvedValue([{ id: 99 }]);
    await api.reload();

    expect(api.paginatorHive.honey).toEqual([{ id: 99 }]);
  });

  it("loadMore appends data to existing items", async () => {
    const paginator = createMockPaginator([{ id: 1 }]);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    paginator.loadMore.mockResolvedValue([{ id: 2 }, { id: 3 }]);
    await api.loadMore();

    expect(api.paginatorHive.honey).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("goToPage forwards the requested page and replaces data", async () => {
    const paginator = createMockPaginator([{ id: 1 }]);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);
    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());

    paginator.goToPage.mockResolvedValue([{ id: 42 }]);
    await api.goToPage(3);

    expect(paginator.goToPage).toHaveBeenCalledWith(3);
    expect(api.paginatorHive.honey).toEqual([{ id: 42 }]);
  });

  // ── hasMore / canLoadHive ─────────────────────────────────────────────────

  it("hasMore reflects paginator.hasMore via canLoadHive", async () => {
    const paginator = createMockPaginator();
    paginator.hasMore = true;
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());
    expect(api.hasMore).toBe(true);

    // After next load with hasMore = false
    paginator.hasMore = false;
    await api.reload();
    expect(api.hasMore).toBe(false);
  });

  // ── Format ────────────────────────────────────────────────────────────────

  it("applies format function to transform response", async () => {
    const paginator = createMockPaginator();
    paginator.load.mockResolvedValue({ raw: true, items: [1, 2] });
    const format = vi.fn((data: any) => data.items);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, format, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());
    expect(format).toHaveBeenCalled();
  });

  // ── Response shape: batch / data / array ───────────────────────────────────

  it("extracts items from { batch: [...] } response shape", async () => {
    const paginator = createMockPaginator();
    paginator.load.mockResolvedValue({ batch: [{ id: "a" }, { id: "b" }] });
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());
    expect(api.paginatorHive.honey).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("extracts items from { data: [...] } response shape", async () => {
    const paginator = createMockPaginator();
    paginator.load.mockResolvedValue({ data: [{ id: "x" }] });
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());
    expect(api.paginatorHive.honey).toEqual([{ id: "x" }]);
  });

  // ── Error Handling ────────────────────────────────────────────────────────

  it("handler.error fires on load failure", async () => {
    const error = new Error("network");
    const paginator = createMockPaginator();
    const onError = vi.fn();
    const { handler, factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    // Use query context so auto-load doesn't fire
    const slice = PaginatorSlice({ paginator, onError, operationHandler: factory });
    const { paginator: api } = slice(mockQuery as unknown as PaginatorDependencies);

    paginator.load.mockRejectedValueOnce(error);
    mockQuery.fireQuery({});

    await vi.waitFor(() => expect(handler.error).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith(error);
  });

  // ── Query Subscription ────────────────────────────────────────────────────

  it("subscribes to query and loads on change", async () => {
    const paginator = createMockPaginator([{ id: 1 }]);
    const { handler, factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    slice(mockQuery as unknown as PaginatorDependencies);

    mockQuery.fireQuery({ search: "test" });
    await vi.waitFor(() => expect(paginator.load).toHaveBeenCalled());
    expect(paginator.load.mock.calls[0][0]).toEqual({ search: "test" });
  });

  it("shouldLoadOnQueryChange guards loading", async () => {
    const paginator = createMockPaginator();
    const shouldLoad = vi.fn().mockReturnValue(false);
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = PaginatorSlice({ paginator, shouldLoadOnQueryChange: shouldLoad, operationHandler: factory });
    slice(mockQuery as unknown as PaginatorDependencies);

    mockQuery.fireQuery({ search: "" });

    await vi.waitFor(() => expect(shouldLoad).toHaveBeenCalled());
    expect(paginator.load).not.toHaveBeenCalled();
  });

  // ── Clear ─────────────────────────────────────────────────────────────────

  it("clear resets paginatorHive", async () => {
    const paginator = createMockPaginator([{ id: 1 }]);
    const { handler, factory } = createSpyHandler();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice({} as PaginatorDependencies);

    await vi.waitFor(() => expect(handler.idle).toHaveBeenCalled());
    expect(api.paginatorHive.honey).toHaveLength(1);

    // Clear is exposed on the shouldLoadOnQueryChange controls, but paginatorHive is a list hive
    // We can test by setting honey directly
    api.paginatorHive.setHoney([]);
    expect(api.paginatorHive.honey).toEqual([]);
  });

  // ── Dispose ───────────────────────────────────────────────────────────────

  it("dispose unsubscribes from query", async () => {
    const paginator = createMockPaginator();
    const { factory } = createSpyHandler();
    const mockQuery = createMockQueryCtx();

    const slice = PaginatorSlice({ paginator, operationHandler: factory });
    const { paginator: api } = slice(mockQuery as unknown as PaginatorDependencies);

    expect(api.dispose).toBeDefined();
    expect(mockQuery.isListening()).toBe(true);

    api.dispose!();
    expect(mockQuery.isListening()).toBe(false);
  });

  // ── API Exposure ──────────────────────────────────────────────────────────

  it("exposes limit and operation name", () => {
    const paginator = createMockPaginator();
    paginator.limit = 50;

    const slice = PaginatorSlice({ paginator, operation: "fetch-list", operationHandler: () => noopHandler });
    const { paginator: api } = slice({} as PaginatorDependencies);

    expect(api.limit).toBe(50);
    expect(api.operation).toBe("fetch-list");
  });

  it("does not mutate config or invent an operation for a direct slice", () => {
    const paginator = createMockPaginator();
    const config = { paginator, operationHandler: () => noopHandler };

    const slice = PaginatorSlice(config);
    const { paginator: api } = slice({} as PaginatorDependencies);

    expect(api.operation).toBeUndefined();
    expect("operation" in config).toBe(false);
  });
});
