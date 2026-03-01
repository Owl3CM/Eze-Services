import React from "react";

// ─── Component Map ───────────────────────────────────────────────────────────
/** Maps filter type names to React components. Projects define their own. */
export type QueryComponentMap = Record<string, React.ComponentType<any>>;

// ─── Filter Definition ───────────────────────────────────────────────────────
/** Common props shared by all filter definitions. */
export type CommonFilterProps = {
  label?: string;
  placement?: "InLine" | "InPopup" | "Auto";
  isMain?: boolean;
  value?: any;
  /** Override the componentMap lookup for this specific filter. */
  Element?: React.ComponentType<any>;
};

/**
 * A single filter definition. `type` must be a key of the componentMap.
 * Extra props from the resolved component are allowed via `[key: string]: any`.
 */
export type FilterDefinition<M extends QueryComponentMap = any> = CommonFilterProps & {
  type: keyof M | (string & {});
  [key: string]: any;
};

// ─── Derived Types ───────────────────────────────────────────────────────────
/** Extract filter IDs as a union type. */
export type IdOf<F> = F extends Record<infer K, any> ? K & string : string;

/** Map filter definitions to a query record (id → value). */
export type QueryRecord<F> = { [K in keyof F]?: any };

// ─── Filter Entry (for rendering) ───────────────────────────────────────────
/** Ready-to-render filter entry returned by `getFilterEntries`. */
export type FilterEntry = {
  id: string;
  type: string;
  label?: string;
  placement?: "InLine" | "InPopup" | "Auto";
  isMain?: boolean;
  value?: any;
  Component: React.ComponentType<any> | undefined;
  props: Record<string, any>;
};

// ─── Config ──────────────────────────────────────────────────────────────────
export interface QuerySliceConfig<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>> {
  componentMap: M;
  filters: F;
  validators?: ((key: IdOf<F>, value: any) => boolean | string)[];
  onQueryChange?: (query: QueryRecord<F>) => void;
  /** System-level debounce (ms). Collapses rapid multi-filter changes into one hive notification. */
  debounce?: number;
  /** Pre-populate query state. Merged on top of filter `value` fields. */
  initialQuery?: Partial<QueryRecord<F>>;
  /** Router integration via dependency injection. */
  router?: {
    read: () => Record<string, any>;
    write: (q: Record<string, any>) => void;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface QueryAPI<M extends QueryComponentMap = any, F extends Record<string, FilterDefinition<M>> = any> {
  /** The filter definitions as configured. */
  filters: F;
  /** Reactive hive holding the current query state. */
  queryHive: import("../../../Hives").IHive<QueryRecord<F>>;
  /** The component map. */
  componentMap: M;

  /** Read a single query param. */
  getParam: <K extends IdOf<F>>(key: K) => any;
  /** Read the full query object. */
  getQuery: () => QueryRecord<F>;
  /** Replace the entire query. */
  setQuery: (q: QueryRecord<F>) => void;
  /** Update a single param (validates first). Returns false if validation fails. */
  updateQuery: <K extends IdOf<F>>(patch: { id: K; value: any }) => boolean;
  /** Atomically update multiple params (single hive notification). */
  updateMany: (patches: { id: IdOf<F>; value: any }[]) => void;
  /** Remove a single param. */
  removeParam: (key: IdOf<F>) => void;
  /** Clear all query params. */
  clearQuery: () => void;
  /** Subscribe to query changes. Fires immediately with current value. */
  listenToQuery: (cb: (q: QueryRecord<F>) => void) => () => void;
  /** Look up the component for a filter type from the componentMap. */
  getFilterComponent: (type: keyof M | string) => React.ComponentType<any> | undefined;
  /** Get all filters as ready-to-render entries with resolved components. */
  getFilterEntries: () => FilterEntry[];
}

// ─── Factory Config ──────────────────────────────────────────────────────────
/** Shared query config shape used by all factory presets. */
export type FactoryQueryConfig<M extends QueryComponentMap = any> = {
  componentMap: M;
  filters: Record<string, FilterDefinition<M>>;
  validators?: ((key: string, value: any) => boolean | string)[];
  onQueryChange?: (query: any) => void;
  debounce?: number;
  initialQuery?: Record<string, any>;
  router?: { read: () => Record<string, any>; write: (q: Record<string, any>) => void };
};
