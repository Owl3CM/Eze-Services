import React from "react"; // compile-time only — used for React.ComponentType references

// ─── Component Map ───────────────────────────────────────────────────────────
/** Maps filter type names to React components. Projects define their own. */
export type QueryComponentMap = Record<string, React.ComponentType<any>>;

// ─── Query Record ────────────────────────────────────────────────────────────
/** Map filter definitions to a query record (id → value). */
export type QueryRecord<F> = { [K in keyof F]?: any };

/** Query record with exact filter keys — no index signature. Gives IDE autocomplete for filter names in predicates. */
export type StrictQueryRecord<F> = { [K in keyof F & string]?: any };

// ─── Filter Predicate ────────────────────────────────────────────────────────
/** Static boolean or function of current query state. */
export type FilterPredicate = boolean | ((query: Record<string, any>) => boolean);

/** Static record or function of current query state. */
export type FilterProps = Record<string, any> | ((query: Record<string, any>) => Record<string, any>);

/** Extract passthrough props from a QueryFilterAdapter (phantom type). Falls back to Record<string, any>. */
export type ExtractPassthrough<T> = T extends { readonly __passthrough?: infer P } ? (P extends undefined ? Record<string, any> : P) : Record<string, any>;

/** Per-type filter props — static or computed from query. */
export type TypedFilterProps<M extends QueryComponentMap, T extends keyof M> =
  | ExtractPassthrough<M[T]>
  | ((query: Record<string, any>) => ExtractPassthrough<M[T]>);

// ─── Filter Definition ───────────────────────────────────────────────────────
/**
 * A single filter definition. Carries only functional fields.
 *
 * - `type` — key of the componentMap OR a React component directly
 * - `value` — per-filter initial/default value
 * - `hidden` — tracked in query state but not rendered (static or computed)
 * - `disabled` — rendered but interaction blocked (static or computed)
 * - `props` — component-specific pass-through (static or computed from query)
 *
 * `TExtra` lets projects add UI metadata (label, placement, tooltip, etc.)
 * that the package doesn't know about.
 */
export type FilterDefinition<M extends QueryComponentMap = any, TExtra extends Record<string, any> = {}> = {
  type: keyof M | (string & {}) | React.ComponentType<any>;
  value?: any;
  hidden?: FilterPredicate;
  disabled?: FilterPredicate;
  /** Component-specific props — passed through to the rendered filter component. */
  props?: FilterProps;
} & TExtra;

/**
 * Type-safe filter input — discriminated by `type`.
 * When `type` is a key from the component map, `props` is constrained
 * to the component's passthrough props (via QueryFilterAdapter phantom type).
 * Used in QuerySliceConfig.filters for compile-time validation.
 */
export type FilterInput<M extends QueryComponentMap, TExtra extends Record<string, any> = {}> =
  | {
      [T in keyof M]: {
        type: T;
        value?: any;
        hidden?: FilterPredicate;
        disabled?: FilterPredicate;
        props?: TypedFilterProps<M, T>;
      } & TExtra;
    }[keyof M]
  | ({
      type: React.ComponentType<any>;
      value?: any;
      hidden?: FilterPredicate;
      disabled?: FilterPredicate;
      props?: FilterProps;
    } & TExtra);

// ─── Derived Types ───────────────────────────────────────────────────────────
/** Extract filter IDs as a union type. */
export type IdOf<F> = F extends Record<infer K, any> ? K & string : string;

// ─── Filter Entry (for rendering) ───────────────────────────────────────────
/**
 * Ready-to-render filter entry returned by `getFilterEntries`.
 *
 * - Functional fields are resolved (hidden, disabled default to false)
 * - `value` is the current value from the hive (not the initial)
 * - `defaultValue` is the value that `resetFilter` would restore (initialQuery > def.value > undefined)
 * - `props` contains resolved component-specific pass-through
 * - `meta` contains TExtra fields from the definition (label, placement, etc.)
 */
export type FilterEntry<TMeta extends Record<string, any> = Record<string, any>, F = any> = {
  id: IdOf<F>;
  type: string;
  value: any;
  /** The value that `resetFilter(id)` would restore (initialQuery override > def.value > undefined). */
  defaultValue: any;
  hidden: boolean;
  disabled: boolean;
  Component: React.ComponentType<any> | undefined;
  /** Resolved component-specific props. */
  props: Record<string, any>;
  /** Project-level metadata from TExtra fields on the definition. */
  meta: TMeta;
};

// ─── Resolved Filters ────────────────────────────────────────────────────────
/** Preserves filter keys while widening values to FilterDefinition<M>. */
export type ResolvedFilters<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>> = {
  [K in keyof F]: FilterDefinition<M>;
};

// ─── Config ──────────────────────────────────────────────────────────────────
export interface QuerySliceConfig<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>, TExtra extends Record<string, any> = {}> {
  componentMap: M;
  /** Filter definitions. Predicates (`hidden`, `disabled`) and `props` accept functions — the query parameter has typed filter keys for IDE autocomplete. */
  filters: {
    [K in keyof F]: FilterInput<M, TExtra> & {
      hidden?: boolean | ((query: StrictQueryRecord<F>) => boolean);
      disabled?: boolean | ((query: StrictQueryRecord<F>) => boolean);
    };
  };
  onQueryChange?: (query: QueryRecord<F>) => void;
  /** Debounce `onQueryChange` notifications (ms). Hive updates immediately; only the callback is collapsed. */
  debounce?: number;
  /** Pre-populate query state. Merged on top of filter `value` fields. */
  initialQuery?: Partial<QueryRecord<F>>;
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface QueryAPI<
  M extends QueryComponentMap = any,
  F extends Record<string, FilterDefinition<M>> = any,
  TMeta extends Record<string, any> = Record<string, any>,
> {
  /** The filter definitions (resolved mapped type — includes registered custom components). */
  filters: ResolvedFilters<M, F>;
  /** Reactive hive holding the current query state. */
  queryHive: import("../../Hives").IHive<QueryRecord<F>>;
  /** The component map (includes registered custom components). */
  componentMap: M;

  /** Read a single query param. */
  getParam: <K extends IdOf<F>>(key: K) => any;
  /** Read the full query object. */
  getQuery: () => QueryRecord<F>;
  /** Replace the entire query. */
  setQuery: (q: QueryRecord<F>) => void;
  /** Update a single param. */
  updateQuery: <K extends IdOf<F>>(patch: { id: K; value: any }) => void;
  /** Atomically update multiple params (single hive notification). */
  updateMany: (patches: { id: IdOf<F>; value: any }[]) => void;
  /** Remove a single param. */
  removeParam: (key: IdOf<F>) => void;
  /** Clear all query params (empty query). */
  clearQuery: () => void;
  /** Reset all filters to initial state (def.value + initialQuery merged). */
  resetQuery: () => void;
  /** Reset a single filter to its default value (initialQuery override > def.value > undefined). */
  resetFilter: <K extends IdOf<F>>(key: K) => void;
  /** Subscribe to query changes. Fires immediately with current value, then on each change. */
  listenToQuery: (cb: (q: QueryRecord<F>) => void) => () => void;
  /** Get all filters as ready-to-render entries with resolved components, props, and predicates. */
  getFilterEntries: () => FilterEntry<TMeta, F>[];
}
