import { createHive, IHive } from "../../../Hives";
import { FilterDefinition, IdOf, QueryRecord, QuerySliceConfig } from "./Types";

// TODO: Investigate — @/Libs/eze-router is a path alias that breaks consumer builds.
// Needs proper solution (dependency injection or peer dep).
// Router sync is disabled until resolved.
//
// let _routerEngine: any = null;
// const getRouterEngine = async () => {
//   if (!_routerEngine) {
//     const mod = await import("@/Libs/eze-router");
//     _routerEngine = mod.RouterEngine;
//   }
//   return _routerEngine;
// };

export const QueryMechanics = {
  createHive: <F extends Record<string, FilterDefinition>>(config: QuerySliceConfig<any, F>) => {
    type Q = QueryRecord<F>;
    return createHive<Q>({} as Q);
  },

  syncInitialQuery: async <F extends Record<string, FilterDefinition>>(hive: IHive<QueryRecord<F>>, config: QuerySliceConfig<any, F>) => {
    // TODO: Re-enable when router dependency is resolved
    // if (config.syncWithRouter !== false) {
    //   const RouterEngine = await getRouterEngine();
    //   const initialQuery = RouterEngine.getQueryParams() as QueryRecord<F>;
    //   hive.setHoney(initialQuery);
    // }
  },

  validate: <F extends Record<string, FilterDefinition>>(config: QuerySliceConfig<any, F>, key: IdOf<F>, value: any): boolean | string => {
    if (!config.validators) return true;
    for (const validator of config.validators) {
      const result = validator(key as any, value);
      if (result !== true) return result;
    }
    return true;
  },

  setQuery: <F extends Record<string, FilterDefinition>>(hive: IHive<QueryRecord<F>>, q: QueryRecord<F>, config: QuerySliceConfig<any, F>) => {
    hive.setHoney(q);
    // TODO: Re-enable when router dependency is resolved
    // if (config.syncWithRouter !== false) {
    //   getRouterEngine().then((RouterEngine) => {
    //     RouterEngine.setQueryParams(q);
    //   });
    // }
    config.onQueryChange?.(q);
  },

  updateQuery: <F extends Record<string, FilterDefinition>, K extends IdOf<F>>(
    hive: IHive<QueryRecord<F>>,
    patch: { id: K; value: any },
    config: QuerySliceConfig<any, F>,
  ) => {
    const result = QueryMechanics.validate(config, patch.id, patch.value);
    if (result !== true) return false;
    QueryMechanics.setQuery(hive, { ...hive.honey, [patch.id]: patch.value }, config);
    return true;
  },

  removeParam: async <F extends Record<string, FilterDefinition>>(hive: IHive<QueryRecord<F>>, key: IdOf<F>, config: QuerySliceConfig<any, F>) => {
    const newQuery = Object.fromEntries(Object.entries(hive.honey).filter(([k]) => k !== key)) as QueryRecord<F>;
    await QueryMechanics.setQuery(hive, newQuery, config);
  },
};
