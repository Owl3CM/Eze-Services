import { Hive } from "../../Hives";
import { createQueryMechanics } from "./QueryMechanics";
import {
  FilterBase,
  FilterDefinition,
  FilterEntry,
  FilterInput,
  IdOf,
  QueryAPI,
  QueryComponentMap,
  QueryEngine,
  QueryRecord,
  QuerySliceConfig,
  ResolvedFilters,
  StrictQueryRecord,
  TypedQuery,
} from "./Types";

// ─── Shared Mutation Logic (R3) ──────────────────────────────────────────────

type Patch<Id extends string = string> = { id: Id; value: any };

/** Apply patches to a query record. Returns the new record if anything changed, or null if nothing changed. */
function applyPatches<Q extends Record<string, any>>(current: Q, patches: Patch[]): Q | null {
  let next: Record<string, any> | null = null;
  for (const { id, value } of patches) {
    if (current[id] === value) continue;
    if (!next) next = { ...current };
    if (value === undefined) delete next[id];
    else next[id] = value;
  }
  return next as Q | null;
}

// ─── Slice ───────────────────────────────────────────────────────────────────

export function QuerySlice<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>, TExtra extends Record<string, any> = {}>(
  config: QuerySliceConfig<M, F, TExtra>,
) {
  return (_ctx: unknown): { query: QueryAPI<M, F, TExtra> } => {
    type Id = IdOf<F>;
    type Q = QueryRecord<F>;

    // Mechanics handles the heavy build-time work
    const m = createQueryMechanics(config);
    const engine = config.engine;

    // Slice owns state
    const initialState = m.deriveInitial();
    const hive = Hive.state<Q>(initialState);
    const commit = m.createCommit(hive);

    // ─── Engine-aware write ──────────────────────────────────────────────
    // When engine exists: forward raw values → engine.set (hive updated via engine.subscribe)
    // When engine absent: direct hive write via commit
    const write = engine ? (q: Q) => engine.set(q as Record<string, any>) : (q: Q) => commit(q);

    // ─── Engine subscribe: incoming changes → hive ──────────────────────
    let unsubscribeEngine: (() => void) | undefined;
    if (engine) {
      let skipFirst = true;
      unsubscribeEngine = engine.subscribe((params) => {
        if (skipFirst) {
          skipFirst = false;
          // First fire: seed hive with engine state merged over initial
          if (params && Object.keys(params).length) {
            commit({ ...initialState, ...params } as Q);
          }
          return;
        }
        // Subsequent: merge over defaults so missing params restore to initialState
        commit({ ...initialState, ...(params ?? {}) } as Q);
      });
    }

    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      unsubscribeEngine?.();
      engine?.dispose?.();
    };

    // ─── Mutation API ──────────────────────────────────────────────────────
    const setQuery = (q: Q) => write(q);

    const updateQuery = <PK extends Id>(patch: Patch<PK>) => {
      const next = applyPatches(hive.honey as Record<string, any>, [patch]);
      if (next) write(next as Q);
    };

    const updateMany = (patches: Patch<Id>[]) => {
      const next = applyPatches(hive.honey as Record<string, any>, patches);
      if (next) write(next as Q);
    };

    const removeParam = (key: Id) => {
      const r = m.resolved[key];
      updateQuery({ id: key, value: r?.required ? r.defaultValue : undefined });
    };

    const removeMany = (keys: Id[]) => {
      updateMany(
        keys.map((id) => {
          const r = m.resolved[id];
          return { id, value: r?.required ? r.defaultValue : undefined };
        }),
      );
    };

    const resetFilter = <PK extends Id>(key: PK) => {
      updateQuery({ id: key, value: m.resolved[key].defaultValue });
    };

    // ─── Computed Helpers (D7) ─────────────────────────────────────────────
    const isDirty = (): boolean => {
      const current = hive.honey as Record<string, any>;
      const initial = initialState as Record<string, any>;
      for (const key of Object.keys(m.resolved)) {
        if (current[key] !== initial[key]) return true;
      }
      return false;
    };

    const activeFilterCount = (): number => {
      const current = hive.honey as Record<string, any>;
      let count = 0;
      for (const key of Object.keys(m.resolved)) {
        if (current[key] !== undefined) count++;
      }
      return count;
    };

    // ─── Filter Entries (cached by reference) ──────────────────────────────
    let cachedQueryRef: Q | null = null;
    let cachedEntries: readonly FilterEntry<TExtra, F>[] = [];

    const getFilterEntries = (): readonly FilterEntry<TExtra, F>[] => {
      const query = hive.honey;
      if (query === cachedQueryRef) return cachedEntries;
      cachedQueryRef = query;
      const qRecord = query as Record<string, any>;
      cachedEntries = Object.entries(m.resolved).map(([id, r]) => ({
        id: id as IdOf<F>,
        type: r.type,
        value: qRecord[id],
        defaultValue: r.defaultValue,
        hidden: r.hidden(qRecord),
        disabled: r.disabled(qRecord),
        Component: r.component,
        props: r.props(qRecord),
        meta: r.meta,
      }));
      return cachedEntries;
    };

    return {
      query: {
        filters: m.filters as ResolvedFilters<M, F>,
        componentMap: m.componentMap as M,
        queryHive: hive,

        getParam: <PK extends Id>(key: PK) => hive.honey?.[key],
        getQuery: () => hive.honey,
        setQuery,
        updateQuery,
        updateMany,
        removeParam,
        removeMany,
        clearQuery: () => {
          const cleared: Record<string, any> = {};
          for (const [id, r] of Object.entries(m.resolved)) {
            if (r.required) cleared[id] = r.defaultValue;
          }
          setQuery(cleared as Q);
        },
        resetQuery: () => setQuery({ ...initialState }),
        resetFilter,
        isDirty,
        activeFilterCount,
        listenToQuery: (cb) => {
          cb(hive.honey);
          return hive.subscribe(cb);
        },
        getFilterEntries,
        dispose,
      },
    };
  };
}

/**
 * Curried QuerySlice builder — locks `componentMap` and `TExtra` at creation,
 * then infers `F` (filter keys) from each call's `filters` object.
 *
 * Eliminates the need for `QuerySlice<typeof map, any, Extra>` everywhere.
 *
 * @example
 * ```ts
 * const query = createQuerySlice<typeof appFilterMap, AppFilterExtra>(appFilterMap);
 *
 * // F is inferred from filters — getParam("search") is typed
 * createFactory()
 *   .use(query({ filters: { search: { type: "text" }, status: { type: "selector", props: { options } } } }))
 *   .build();
 * ```
 */
export function createQuerySlice<M extends QueryComponentMap, TExtra extends Record<string, any> = {}>(componentMap: M) {
  return <F extends Record<string, FilterInput<M, TExtra>>>(config: {
    filters: {
      [K in keyof F]: FilterInput<M, TExtra> & {
        hidden?: boolean | ((query: StrictQueryRecord<F>) => boolean);
        disabled?: boolean | ((query: StrictQueryRecord<F>) => boolean);
      };
    };
    /** Fires when the query changes. When `debounce` is set, this callback is collapsed — the hive updates immediately. */
    onQueryChange?: (query: QueryRecord<F>) => void;
    /** Debounce `onQueryChange` notifications (ms). Hive updates immediately; only the callback is collapsed. Does NOT affect `createQueryFilter` adapter debounce (which delays hive writes for controlled inputs). */
    debounce?: number;
    initialQuery?: Partial<QueryRecord<F>>;
    /** External state engine. When provided, all mutations go through engine.set, engine.subscribe → hive. */
    engine?: QueryEngine;
  }) => QuerySlice<M, F, TExtra>({ ...config, componentMap } as QuerySliceConfig<M, F, TExtra>);
}

// ─── Typed Value Builder (Inference-First) ─────────────────────────────────────

/**
 * Typed-value query slice builder — infers value types from `value` fields.
 *
 * Trade-off vs `createQuerySlice`:
 * - ✅ `getParam("search")` returns `string`, not `any`
 * - ✅ `updateQuery({ id: "search", value: 123 })` is a type error
 * - ❌ No predicate autocomplete (predicates use `(q: any) => boolean`)
 * - ❌ No FilterInput props validation (props is `any`)
 *
 * @example
 * ```ts
 * const query = createTypedQuerySlice(appFilterMap);
 *
 * createFactory()
 *   .use(query({
 *     filters: {
 *       search: { type: "text", value: "" },       // → string
 *       active: { type: "boolean", value: false },  // → boolean
 *     },
 *   }))
 *   .build();
 * ```
 */
export function createTypedQuerySlice<M extends QueryComponentMap, TExtra extends Record<string, any> = {}>(componentMap: M) {
  return <F extends Record<string, FilterBase<M> & TExtra>>(config: {
    filters: F;
    onQueryChange?: (query: TypedQuery<F>) => void;
    debounce?: number;
    initialQuery?: Partial<TypedQuery<F>>;
    engine?: QueryEngine;
  }) => {
    // Delegate to QuerySlice with the same runtime logic
    return QuerySlice<M, F, TExtra>({
      ...config,
      componentMap,
    } as QuerySliceConfig<M, F, TExtra>);
  };
}
