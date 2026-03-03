import { Hive } from "../../Hives";
import { createQueryMechanics } from "./QueryMechanics";
import {
  FilterDefinition,
  FilterEntry,
  FilterInput,
  IdOf,
  QueryAPI,
  QueryComponentMap,
  QueryRecord,
  QuerySliceConfig,
  ResolvedFilters,
  StrictQueryRecord,
} from "./Types";

export function QuerySlice<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>, TExtra extends Record<string, any> = {}>(
  config: QuerySliceConfig<M, F, TExtra>,
) {
  return (_ctx: unknown): { query: QueryAPI<M, F, TExtra> } => {
    type Id = IdOf<F>;
    type Q = QueryRecord<F>;

    // Mechanics handles the heavy build-time work
    const m = createQueryMechanics(config);

    // Slice owns state
    const initialState = m.deriveInitial();
    const hive = Hive.state<Q>(initialState);
    const commit = m.createCommit(hive);

    // ─── API Methods ──────────────────────────────────────────────────────
    const setQuery = (q: Q) => commit(q);

    const updateQuery = <PK extends Id>(patch: { id: PK; value: any }) => {
      const current = hive.honey as Record<string, any>;
      if (current[patch.id] === patch.value) return;
      const next: Record<string, any> = { ...current };
      if (patch.value === undefined) delete next[patch.id];
      else next[patch.id] = patch.value;
      commit(next as Q);
    };

    const updateMany = (patches: { id: Id; value: any }[]) => {
      const current: Record<string, any> = { ...hive.honey };
      let changed = false;
      for (const patch of patches) {
        if (current[patch.id] !== patch.value) {
          if (patch.value === undefined) delete current[patch.id];
          else current[patch.id] = patch.value;
          changed = true;
        }
      }
      if (changed) commit(current as Q);
    };

    const removeParam = (key: Id) => updateQuery({ id: key, value: undefined });

    const resetFilter = <PK extends Id>(key: PK) => {
      updateQuery({ id: key, value: m.cachedDefaultMap[key] });
    };

    let cachedQueryRef: Q | null = null;
    let cachedEntries: FilterEntry<TExtra, F>[] = [];

    const getFilterEntries = (): FilterEntry<TExtra, F>[] => {
      const query = hive.honey;
      if (query === cachedQueryRef) return cachedEntries;
      cachedQueryRef = query;
      const qRecord = query as Record<string, any>;
      cachedEntries = Object.entries(m.filters).map(([id]) => ({
        id: id as IdOf<F>,
        type: m.resolvedTypeMap[id],
        value: qRecord[id],
        defaultValue: m.cachedDefaultMap[id],
        hidden: m.resolvers[id].hidden(qRecord),
        disabled: m.resolvers[id].disabled(qRecord),
        Component: m.cachedComponentMap[id],
        props: m.resolvers[id].props(qRecord),
        meta: m.cachedMetaMap[id],
      }));
      return cachedEntries;
    };

    return {
      query: {
        filters: m.filters as ResolvedFilters<M, F>,
        componentMap: m.resolvedComponentMap as M,
        queryHive: hive,

        getParam: <PK extends Id>(key: PK) => hive.honey?.[key],
        getQuery: () => hive.honey,
        setQuery,
        updateQuery,
        updateMany,
        removeParam,
        clearQuery: () => setQuery({} as Q),
        resetQuery: () => setQuery({ ...initialState }),
        resetFilter,
        listenToQuery: (cb) => {
          cb(hive.honey);
          return hive.subscribe(cb);
        },
        getFilterEntries,
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
    onQueryChange?: (query: QueryRecord<F>) => void;
    debounce?: number;
    initialQuery?: Partial<QueryRecord<F>>;
  }) => QuerySlice<M, F, TExtra>({ ...config, componentMap } as QuerySliceConfig<M, F, TExtra>);
}
