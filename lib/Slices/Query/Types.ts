import React from "react"; // compile-time only — used for React.ComponentType references

// ─── Component Map ───────────────────────────────────────────────────────────
/** Maps filter type names to React components. Projects define their own. */
export type QueryComponentMap = Record<string, React.ComponentType<any>>;

// ─── Query Record ────────────────────────────────────────────────────────────
/** Map filter definitions to a query record (id → value). */
export type QueryRecord<F> = { [K in keyof F]?: any };

/** Query record with exact filter keys — no index signature. Gives IDE autocomplete for filter names in predicates. */
export type StrictQueryRecord<F> = { [K in keyof F & string]?: any };

// ─── Typed Value Inference ───────────────────────────────────────────────────
/** Extract value types from filter definitions. Filters without `value` fallback to `unknown`. */
export type InferValueMap<F> = {
  [K in keyof F]: F[K] extends { value: infer V } ? V : unknown;
};

/** Typed query record — values inferred from filter definitions. */
export type TypedQuery<F> = { [K in keyof F & string]?: InferValueMap<F>[K] };

/**
 * Structural filter constraint for inference-first pattern.
 * Uses a simple shape instead of FilterInput union to preserve literal value types.
 * TExtra fields pass through via index signature.
 */
export type FilterBase<M extends QueryComponentMap> = {
  type: keyof M | (string & {}) | React.ComponentType<any>;
  value?: any;
  required?: boolean;
  hidden?: boolean | ((q: any) => boolean);
  disabled?: boolean | ((q: any) => boolean);
  props?: any;
  [k: string]: any;
};

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
  /** When true, `clearQuery()` and `removeParam()` restore default value instead of deleting. */
  required?: boolean;
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
        required?: boolean;
        hidden?: FilterPredicate;
        disabled?: FilterPredicate;
        props?: TypedFilterProps<M, T>;
      } & TExtra;
    }[keyof M]
  | ({
      type: React.ComponentType<any>;
      value?: any;
      required?: boolean;
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
  /** Fires when the query changes. When `debounce` is set, this callback is collapsed — the hive updates immediately. */
  onQueryChange?: (query: QueryRecord<F>) => void;
  /**
   * Debounce `onQueryChange` notifications (ms).
   * Hive updates immediately; only the callback is collapsed.
   *
   * NOTE: This is separate from `createQueryFilter` adapter debounce,
   * which delays hive writes for controlled inputs (UX concern).
   * This debounce controls the notification callback (API concern).
   */
  debounce?: number;
  /** Pre-populate query state. Merged on top of filter `value` fields. */
  initialQuery?: Partial<QueryRecord<F>>;
  /**
   * External state engine (URL router, localStorage, WebSocket, etc.).
   * When provided, all mutations go through engine.set, and engine.subscribe → hive.
   * Hive becomes a read-only mirror of the engine state.
   */
  engine?: QueryEngine;
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
  /** Remove multiple params atomically (single hive notification). */
  removeMany: (keys: IdOf<F>[]) => void;
  /** Clear all query params (empty query). */
  clearQuery: () => void;
  /** Reset all filters to initial state (def.value + initialQuery merged). */
  resetQuery: () => void;
  /** Reset a single filter to its default value (initialQuery override > def.value > undefined). */
  resetFilter: <K extends IdOf<F>>(key: K) => void;
  /** Returns true if current query differs from initial state. */
  isDirty: () => boolean;
  /** Count of query params that have a defined (non-undefined) value. */
  activeFilterCount: () => number;
  /** Subscribe to query changes. Fires immediately with current value, then on each change. */
  listenToQuery: (cb: (q: QueryRecord<F>) => void) => () => void;
  /** Get all filters as ready-to-render entries with resolved components, props, and predicates. */
  getFilterEntries: () => ReadonlyArray<FilterEntry<TMeta, F>>;
  /** Unsubscribe from the external engine and release its resources. Idempotent. */
  dispose: () => void;
}

// ─── Query Engine ────────────────────────────────────────────────────────────
/**
 * Generic state sync engine — set + subscribe pattern.
 * Projects implement this to bridge their router (or any external store)
 * into QuerySlice. When provided, QuerySlice forwards all mutations through
 * the engine and listens for external changes.
 *
 * The engine speaks QuerySlice's language (Record<string, any>).
 * Serialization to/from strings (for URL, localStorage, etc.) is the
 * adapter's responsibility, not the slice's.
 */
export interface QueryEngine {
  /** Set the full query state. */
  set: (params: Record<string, any>) => void;
  /** Subscribe to state changes. Fires immediately with current value. Returns unsubscribe. */
  subscribe: (cb: (params: Record<string, any> | null) => void) => () => void;
  /** Cleanup — called when the slice is disposed (path navigation, unmount). Optional. */
  dispose?: () => void;
}
