import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QuerySlice, createTypedQuerySlice } from "../Slices/Query/QuerySlice";
import type { FilterDefinition, QueryComponentMap, QueryEngine } from "../Slices/Query/Types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Minimal mock component map for testing. */
const testMap: QueryComponentMap = {
  text: (() => null) as any,
  selector: (() => null) as any,
};

/** Build a query context from config — calls the slice factory with a dummy ctx. */
function buildQuery(
  filters: Record<string, FilterDefinition<typeof testMap>>,
  options?: { initialQuery?: Record<string, any>; debounce?: number; onQueryChange?: (q: any) => void; engine?: QueryEngine },
) {
  const slice = QuerySlice({
    componentMap: testMap,
    filters: filters as any,
    initialQuery: options?.initialQuery,
    debounce: options?.debounce,
    onQueryChange: options?.onQueryChange,
    engine: options?.engine,
  });
  return slice({}).query;
}

/** Create a mock QueryEngine for testing engine integration. */
function createMockEngine(): QueryEngine & {
  params: Record<string, any>;
  subscribers: ((q: Record<string, any> | null) => void)[];
  fireChange: (params: Record<string, any> | null) => void;
} {
  const state = {
    params: {} as Record<string, any>,
    subscribers: [] as ((q: Record<string, any> | null) => void)[],
  };
  const dispose = vi.fn();
  return {
    get params() {
      return state.params;
    },
    get subscribers() {
      return state.subscribers;
    },
    set: (p: Record<string, any>) => {
      state.params = p;
    },
    subscribe: (cb: (q: Record<string, any> | null) => void) => {
      state.subscribers.push(cb);
      cb(state.params);
      return () => {
        state.subscribers = state.subscribers.filter((l) => l !== cb);
      };
    },
    fireChange: (params: Record<string, any> | null) => {
      for (const cb of state.subscribers) cb(params);
    },
    dispose,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("QuerySlice", () => {
  // ── Meta ───────────────────────────────────────────────────────────────────

  describe("typed meta (TExtra → TMeta)", () => {
    it("returns TExtra fields as meta on FilterEntry", () => {
      const q = buildQuery({
        search: { type: "text", label: "Search", placement: "InLine" } as any,
        status: { type: "selector", label: "Status" } as any,
      });

      const entries = q.getFilterEntries();
      expect(entries[0].meta).toEqual({ label: "Search", placement: "InLine" });
      expect(entries[1].meta).toEqual({ label: "Status" });
    });

    it("returns empty meta when no TExtra fields", () => {
      const q = buildQuery({ search: { type: "text" } });
      expect(q.getFilterEntries()[0].meta).toEqual({});
    });
  });

  // ── Computed hidden / disabled ─────────────────────────────────────────────

  describe("computed hidden", () => {
    it("evaluates function predicate based on current query", () => {
      const q = buildQuery({
        role: { type: "selector", value: "user" },
        premium: { type: "text", hidden: (query: any) => query.role !== "admin" },
      });

      // Initially role="user" → premium is hidden
      let entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "premium")!.hidden).toBe(true);

      // Change role to admin → premium becomes visible
      q.updateQuery({ id: "role", value: "admin" });
      entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "premium")!.hidden).toBe(false);
    });

    it("works with static boolean true", () => {
      const q = buildQuery({ secret: { type: "text", hidden: true } });
      expect(q.getFilterEntries()[0].hidden).toBe(true);
    });

    it("defaults to false when omitted", () => {
      const q = buildQuery({ visible: { type: "text" } });
      expect(q.getFilterEntries()[0].hidden).toBe(false);
    });
  });

  describe("computed disabled", () => {
    it("evaluates function predicate based on current query", () => {
      const q = buildQuery({
        country: { type: "selector" },
        city: { type: "selector", disabled: (query: any) => !query.country },
      });

      // Initially country is undefined → city is disabled
      let entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "city")!.disabled).toBe(true);

      // Set country → city becomes enabled
      q.updateQuery({ id: "country", value: "us" });
      entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "city")!.disabled).toBe(false);
    });

    it("works with static boolean true", () => {
      const q = buildQuery({ locked: { type: "text", disabled: true } });
      expect(q.getFilterEntries()[0].disabled).toBe(true);
    });

    it("defaults to false when omitted", () => {
      const q = buildQuery({ enabled: { type: "text" } });
      expect(q.getFilterEntries()[0].disabled).toBe(false);
    });
  });

  // ── Dynamic props ──────────────────────────────────────────────────────────

  describe("dynamic props", () => {
    it("evaluates props function with current query", () => {
      const q = buildQuery({
        country: { type: "selector", value: "us" },
        city: {
          type: "selector",
          props: (query: any) => ({ options: query.country === "us" ? ["NYC", "LA"] : ["London"] }),
        },
      });

      let entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "city")!.props).toEqual({ options: ["NYC", "LA"] });

      q.updateQuery({ id: "country", value: "uk" });
      entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "city")!.props).toEqual({ options: ["London"] });
    });

    it("works with static props object", () => {
      const q = buildQuery({
        status: { type: "selector", props: { options: [{ value: "a", label: "A" }] } },
      });
      expect(q.getFilterEntries()[0].props).toEqual({ options: [{ value: "a", label: "A" }] });
    });

    it("defaults to empty object when omitted", () => {
      const q = buildQuery({ search: { type: "text" } });
      expect(q.getFilterEntries()[0].props).toEqual({});
    });
  });

  // ── Default values ─────────────────────────────────────────────────────────

  describe("defaultValue on FilterEntry", () => {
    it("returns def.value when no initialQuery override", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
        count: { type: "text", value: 42 },
      });

      const entries = q.getFilterEntries();
      expect(entries.find((e) => e.id === "search")!.defaultValue).toBe("hello");
      expect(entries.find((e) => e.id === "count")!.defaultValue).toBe(42);
    });

    it("returns initialQuery value when it overrides def.value", () => {
      const q = buildQuery({ status: { type: "selector", value: "pending" } }, { initialQuery: { status: "active" } });

      // defaultValue should be what resetFilter would restore → initialQuery wins
      expect(q.getFilterEntries()[0].defaultValue).toBe("active");
    });

    it("defaultValue is undefined when no value defined and no initialQuery", () => {
      const q = buildQuery({ search: { type: "text" } });
      expect(q.getFilterEntries()[0].defaultValue).toBeUndefined();
    });
  });

  // ── resetFilter ────────────────────────────────────────────────────────────

  describe("resetFilter", () => {
    it("resets a single filter to its def.value", () => {
      const q = buildQuery({
        search: { type: "text", value: "default" },
        status: { type: "selector", value: "active" },
      });

      q.updateQuery({ id: "search", value: "changed" });
      expect(q.getParam("search")).toBe("changed");

      q.resetFilter("search");
      expect(q.getParam("search")).toBe("default");
      // Other filters untouched
      expect(q.getParam("status")).toBe("active");
    });

    it("resets to initialQuery value when it overrides def.value", () => {
      const q = buildQuery(
        {
          search: { type: "text", value: "def-val" },
        },
        { initialQuery: { search: "initial-val" } },
      );

      // Initial state should be initialQuery value
      expect(q.getParam("search")).toBe("initial-val");

      q.updateQuery({ id: "search", value: "changed" });
      q.resetFilter("search");

      // Should reset to initialQuery value (wins over def.value)
      expect(q.getParam("search")).toBe("initial-val");
    });

    it("resets to undefined when no default and no initialQuery", () => {
      const q = buildQuery({ search: { type: "text" } });

      q.updateQuery({ id: "search", value: "typed" });
      q.resetFilter("search");
      expect(q.getParam("search")).toBeUndefined();
    });

    it("falls through to def.value when key is NOT in initialQuery", () => {
      const q = buildQuery(
        {
          search: { type: "text", value: "from-def" },
          status: { type: "selector", value: "pending" },
        },
        { initialQuery: { status: "active" } },
      );

      q.updateQuery({ id: "search", value: "changed" });
      q.resetFilter("search");

      // search has no initialQuery override → falls through to def.value
      expect(q.getParam("search")).toBe("from-def");
      // status was set by initialQuery and not changed by resetFilter("search")
      expect(q.getParam("status")).toBe("active");
    });
  });

  // ── resetQuery regression ──────────────────────────────────────────────────

  describe("resetQuery", () => {
    it("resets all filters to initial state", () => {
      const q = buildQuery(
        {
          search: { type: "text", value: "default" },
          status: { type: "selector" },
        },
        { initialQuery: { status: "active" } },
      );

      q.updateQuery({ id: "search", value: "changed" });
      q.updateQuery({ id: "status", value: "archived" });

      q.resetQuery();

      expect(q.getParam("search")).toBe("default");
      expect(q.getParam("status")).toBe("active");
    });
  });

  // ── clearQuery + predicates ────────────────────────────────────────────────

  describe("clearQuery", () => {
    it("clears all params and predicates re-evaluate with empty query", () => {
      const q = buildQuery({
        country: { type: "selector", value: "us" },
        city: { type: "selector", disabled: (query: any) => !query.country },
      });

      // Initially country="us" → city enabled
      expect(q.getFilterEntries().find((e) => e.id === "city")!.disabled).toBe(false);

      q.clearQuery();

      // After clear → country undefined → city disabled
      expect(q.getParam("country")).toBeUndefined();
      expect(q.getFilterEntries().find((e) => e.id === "city")!.disabled).toBe(true);
    });
  });

  // ── Custom component registration ─────────────────────────────────────────

  describe("custom component registration", () => {
    it("registers a React component directly as filter type", () => {
      const CustomComponent = (() => null) as any;
      const q = buildQuery({
        custom: { type: CustomComponent },
      });

      const entry = q.getFilterEntries()[0];
      expect(entry.Component).toBe(CustomComponent);
      expect(entry.type).toMatch(/^__custom_/);
    });

    it("resolves component from componentMap for string types", () => {
      const q = buildQuery({
        search: { type: "text" },
      });

      const entry = q.getFilterEntries()[0];
      expect(entry.Component).toBe(testMap.text);
      expect(entry.type).toBe("text");
    });
  });

  // ── updateMany no-op detection ─────────────────────────────────────────────

  describe("updateMany", () => {
    it("only triggers commit when at least one value changes", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          a: { type: "text", value: "x" },
          b: { type: "text", value: "y" },
        },
        { onQueryChange: onChange },
      );

      onChange.mockClear();

      // All same values — no commit
      q.updateMany([
        { id: "a", value: "x" },
        { id: "b", value: "y" },
      ]);
      expect(onChange).not.toHaveBeenCalled();

      // One changed — commit fires
      q.updateMany([
        { id: "a", value: "x" },
        { id: "b", value: "z" },
      ]);
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── updateQuery no-op detection ────────────────────────────────────────────

  describe("updateQuery", () => {
    it("skips commit when value is the same", () => {
      const onChange = vi.fn();
      const q = buildQuery({ search: { type: "text", value: "hello" } }, { onQueryChange: onChange });

      onChange.mockClear();

      q.updateQuery({ id: "search", value: "hello" });
      expect(onChange).not.toHaveBeenCalled();

      q.updateQuery({ id: "search", value: "world" });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── Debounce integration ───────────────────────────────────────────────────

  describe("debounce", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("collapses rapid onQueryChange notifications into one", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          a: { type: "text" },
          b: { type: "text" },
        },
        { debounce: 200, onQueryChange: onChange },
      );

      onChange.mockClear();

      q.updateMany([
        { id: "a", value: "1" },
        { id: "b", value: "2" },
      ]);

      // Nothing fired yet
      expect(onChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);

      // Only one notification after debounce window
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: "1", b: "2" }));
    });

    it("sequential updateQuery calls during debounce window preserve all values", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          a: { type: "text" },
          b: { type: "text" },
        },
        { debounce: 200, onQueryChange: onChange },
      );

      onChange.mockClear();

      // Sequential individual updates — both should be present
      q.updateQuery({ id: "a", value: "1" });
      q.updateQuery({ id: "b", value: "2" });

      // Hive is immediately updated — reads are fresh
      expect(q.getParam("a")).toBe("1");
      expect(q.getParam("b")).toBe("2");

      // onQueryChange not fired yet (debounced)
      expect(onChange).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);

      // Final notification has both values
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: "1", b: "2" }));
    });
  });

  // ── listenToQuery ──────────────────────────────────────────────────────────

  describe("listenToQuery", () => {
    it("fires immediately with current value, then on each change", () => {
      const q = buildQuery({
        search: { type: "text", value: "initial" },
      });

      const listener = vi.fn();
      const unsub = q.listenToQuery(listener);

      // Should have fired immediately
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ search: "initial" }));

      // Fires on change
      q.updateQuery({ id: "search", value: "changed" });
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ search: "changed" }));

      // Unsubscribe works
      unsub();
      q.updateQuery({ id: "search", value: "after-unsub" });
      expect(listener).toHaveBeenCalledTimes(2); // No additional call
    });
  });

  // ── isDirty ──────────────────────────────────────────────────────────────

  describe("isDirty", () => {
    it("returns false at initial state", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
        status: { type: "selector", value: "active" },
      });
      expect(q.isDirty()).toBe(false);
    });

    it("returns true after a value changes", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
      });
      q.updateQuery({ id: "search", value: "changed" });
      expect(q.isDirty()).toBe(true);
    });

    it("returns false after resetQuery()", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
      });
      q.updateQuery({ id: "search", value: "changed" });
      q.resetQuery();
      expect(q.isDirty()).toBe(false);
    });

    it("considers initialQuery overrides in dirty check", () => {
      const q = buildQuery({ status: { type: "selector", value: "pending" } }, { initialQuery: { status: "active" } });
      // Initial state is "active" (from initialQuery), not "pending"
      expect(q.isDirty()).toBe(false);

      q.updateQuery({ id: "status", value: "pending" });
      expect(q.isDirty()).toBe(true);
    });
  });

  // ── activeFilterCount ──────────────────────────────────────────────────

  describe("activeFilterCount", () => {
    it("returns 0 when no filter has a defined value", () => {
      const q = buildQuery({
        search: { type: "text" },
        status: { type: "selector" },
      });
      expect(q.activeFilterCount()).toBe(0);
    });

    it("counts filters with defined values", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
        status: { type: "selector" },
        active: { type: "text", value: true },
      });
      expect(q.activeFilterCount()).toBe(2); // search + active
    });

    it("updates count when params are set or removed", () => {
      const q = buildQuery({
        search: { type: "text" },
        status: { type: "selector" },
      });

      q.updateQuery({ id: "search", value: "hello" });
      expect(q.activeFilterCount()).toBe(1);

      q.updateQuery({ id: "status", value: "active" });
      expect(q.activeFilterCount()).toBe(2);

      q.removeParam("search");
      expect(q.activeFilterCount()).toBe(1);
    });

    it("returns 0 after clearQuery()", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
        status: { type: "selector", value: "active" },
      });
      q.clearQuery();
      expect(q.activeFilterCount()).toBe(0);
    });
  });

  // ── removeMany ──────────────────────────────────────────────────────────

  describe("removeMany", () => {
    it("removes multiple params atomically", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          a: { type: "text", value: "x" },
          b: { type: "text", value: "y" },
          c: { type: "text", value: "z" },
        },
        { onQueryChange: onChange },
      );

      onChange.mockClear();

      q.removeMany(["a", "b"]);

      expect(q.getParam("a")).toBeUndefined();
      expect(q.getParam("b")).toBeUndefined();
      expect(q.getParam("c")).toBe("z");
      // Single commit — only one notification
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("is a no-op when all keys are already undefined", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          a: { type: "text" },
          b: { type: "text" },
        },
        { onQueryChange: onChange },
      );

      onChange.mockClear();

      q.removeMany(["a", "b"]);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ── Engine Integration ──────────────────────────────────────────────────────

  describe("engine integration", () => {
    it("does NOT sync defaults to engine on init (prevents URL pollution)", () => {
      const engine = createMockEngine();
      buildQuery({ search: { type: "text", value: "hello" }, count: { type: "text", value: 42 } }, { engine });

      // Defaults live in hive only — engine stays clean
      expect(engine.params.search).toBeUndefined();
      expect(engine.params.count).toBeUndefined();
    });

    it("seeds hive from engine on init when engine has existing params", () => {
      const engine = createMockEngine();
      engine.params.search = "from-engine";
      engine.params.active = true;

      const q = buildQuery({ search: { type: "text", value: "" }, active: { type: "text", value: false } }, { engine });

      // Hive seeded from engine values
      expect(q.getParam("search")).toBe("from-engine");
      expect(q.getParam("active")).toBe(true);
    });

    it("forwards mutations to engine instead of direct hive write", () => {
      const engine = createMockEngine();
      const q = buildQuery({ search: { type: "text", value: "" }, active: { type: "text", value: false } }, { engine });

      q.updateQuery({ id: "search", value: "hello" });
      expect(engine.params.search).toBe("hello");

      q.updateQuery({ id: "active", value: true });
      expect(engine.params.active).toBe(true);
    });

    it("responds to external engine changes (popstate)", () => {
      const engine = createMockEngine();
      const q = buildQuery({ search: { type: "text", value: "" } }, { engine });

      // Simulate external change (e.g. browser back)
      engine.fireChange({ search: "external" });
      expect(q.getParam("search")).toBe("external");
    });

    it("clearQuery preserves required filters via engine", () => {
      const engine = createMockEngine();
      const q = buildQuery(
        {
          page: { type: "text", value: 1, required: true },
          search: { type: "text", value: "" },
        },
        { engine },
      );

      q.updateQuery({ id: "search", value: "hello" });
      q.clearQuery();

      expect(engine.params.page).toBe(1);
      expect(engine.params.search).toBeUndefined();
    });

    it("dispose unsubscribes and disposes the engine exactly once", () => {
      const engine = createMockEngine();
      const q = buildQuery({ search: { type: "text", value: "" } }, { engine });

      expect(engine.subscribers).toHaveLength(1);
      q.dispose();
      q.dispose();

      expect(engine.subscribers).toHaveLength(0);
      expect(engine.dispose).toHaveBeenCalledTimes(1);

      engine.fireChange({ search: "ignored-after-dispose" });
      expect(q.getParam("search")).toBe("");
    });
  });

  // ── Required Filters ───────────────────────────────────────────────────────

  describe("required filters", () => {
    it("clearQuery preserves required filter defaults", () => {
      const q = buildQuery({
        search: { type: "text", value: "hello" },
        page: { type: "text", value: 1, required: true },
        sort: { type: "text", value: "name", required: true },
      });

      q.updateQuery({ id: "search", value: "changed" });
      q.updateQuery({ id: "page", value: 5 });

      q.clearQuery();

      // Non-required cleared to undefined
      expect(q.getParam("search")).toBeUndefined();
      // Required restored to defaults
      expect(q.getParam("page")).toBe(1);
      expect(q.getParam("sort")).toBe("name");
    });

    it("removeParam on required filter restores default instead of deleting", () => {
      const q = buildQuery({
        page: { type: "text", value: 1, required: true },
        search: { type: "text", value: "hello" },
      });

      q.updateQuery({ id: "page", value: 10 });
      q.removeParam("page");
      expect(q.getParam("page")).toBe(1); // restored, not undefined

      q.removeParam("search");
      expect(q.getParam("search")).toBeUndefined(); // non-required → deleted
    });

    it("removeMany on required filters restores defaults", () => {
      const onChange = vi.fn();
      const q = buildQuery(
        {
          page: { type: "text", value: 1, required: true },
          sort: { type: "text", value: "name", required: true },
          search: { type: "text", value: "hello" },
        },
        { onQueryChange: onChange },
      );

      q.updateQuery({ id: "page", value: 5 });
      q.updateQuery({ id: "sort", value: "date" });
      onChange.mockClear();

      q.removeMany(["page", "sort", "search"]);

      // Required restored
      expect(q.getParam("page")).toBe(1);
      expect(q.getParam("sort")).toBe("name");
      // Non-required deleted
      expect(q.getParam("search")).toBeUndefined();
      // Single commit
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("resetQuery ignores required flag — resets everything to initial state", () => {
      const q = buildQuery({
        page: { type: "text", value: 1, required: true },
        search: { type: "text", value: "hello" },
      });

      q.updateQuery({ id: "page", value: 99 });
      q.updateQuery({ id: "search", value: "changed" });

      q.resetQuery();

      // resetQuery restores to initial state regardless of required
      expect(q.getParam("page")).toBe(1);
      expect(q.getParam("search")).toBe("hello");
    });

    it("clearQuery with initialQuery on required filter uses initialQuery value", () => {
      const q = buildQuery({ page: { type: "text", value: 1, required: true } }, { initialQuery: { page: 3 } });

      q.updateQuery({ id: "page", value: 10 });
      q.clearQuery();

      // Default = initialQuery value (3), not def.value (1)
      expect(q.getParam("page")).toBe(3);
    });
  });

  // ── createTypedQuerySlice ──────────────────────────────────────────────────

  describe("createTypedQuerySlice", () => {
    it("returns same runtime behavior as createQuerySlice", () => {
      const typedQuery = createTypedQuerySlice(testMap);
      const slice = typedQuery({
        filters: {
          search: { type: "text", value: "" },
          active: { type: "text", value: false },
          count: { type: "text", value: 0 },
        },
      });

      const ctx = slice({});
      const q = ctx.query;

      // Runtime behavior is identical
      expect(q.getParam("search")).toBe("");
      expect(q.getParam("active")).toBe(false);
      expect(q.getParam("count")).toBe(0);

      q.updateQuery({ id: "search", value: "hello" });
      expect(q.getParam("search")).toBe("hello");

      q.resetQuery();
      expect(q.getParam("search")).toBe("");
    });

    it("supports required filters", () => {
      const typedQuery = createTypedQuerySlice(testMap);
      const slice = typedQuery({
        filters: {
          page: { type: "text", value: 1, required: true },
          search: { type: "text", value: "" },
        },
      });

      const q = slice({}).query;

      q.updateQuery({ id: "page", value: 5 });
      q.clearQuery();

      expect(q.getParam("page")).toBe(1); // preserved
      expect(q.getParam("search")).toBeUndefined(); // cleared
    });

    it("supports initialQuery and onQueryChange", () => {
      const onChange = vi.fn();
      const typedQuery = createTypedQuerySlice(testMap);
      const slice = typedQuery({
        filters: {
          search: { type: "text", value: "" },
        },
        initialQuery: { search: "initial" },
        onQueryChange: onChange,
      });

      const q = slice({}).query;
      expect(q.getParam("search")).toBe("initial");

      onChange.mockClear();
      q.updateQuery({ id: "search", value: "changed" });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
