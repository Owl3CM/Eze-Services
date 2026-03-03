import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import type { FilterDefinition, QueryComponentMap } from "../Slices/Query/Types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Minimal mock component map for testing. */
const testMap: QueryComponentMap = {
  text: (() => null) as any,
  selector: (() => null) as any,
};

/** Build a query context from config — calls the slice factory with a dummy ctx. */
function buildQuery<F extends Record<string, FilterDefinition<typeof testMap>>>(
  filters: F,
  options?: { initialQuery?: Partial<{ [K in keyof F]?: any }>; debounce?: number; onQueryChange?: (q: any) => void },
) {
  const slice = QuerySlice({
    componentMap: testMap,
    filters,
    initialQuery: options?.initialQuery,
    debounce: options?.debounce,
    onQueryChange: options?.onQueryChange,
  });
  return slice({}).query;
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
});
