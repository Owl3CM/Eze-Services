import { IHive } from "../../Hives";
import { FilterDefinition, QueryComponentMap, QueryRecord, QuerySliceConfig } from "./Types";

/** Functional keys on FilterDefinition — typed so the set stays in sync with the type. */
type FunctionalKey = keyof Pick<FilterDefinition, "type" | "value" | "hidden" | "disabled" | "props">;
const DEFINITION_KEYS: ReadonlySet<string> = new Set<FunctionalKey>(["type", "value", "hidden", "disabled", "props"]);

/** Pre-built resolver closures for a single filter's dynamic fields. */
type FilterResolvers = {
  hidden: (query: Record<string, any>) => boolean;
  disabled: (query: Record<string, any>) => boolean;
  props: (query: Record<string, any>) => Record<string, any>;
};

/**
 * Builds the heavy parts at construction time:
 * - Resolves component registration (type = Component → map key)
 * - Builds the commit function (debounced or direct)
 * - Caches static data (type key, component ref, meta, defaults) per filter
 * - Pre-resolves predicates and props into per-filter closures (zero typeof at call time)
 * - Computes initial/default state
 *
 * Does NOT own state or API — that's the slice's job.
 */
export function createQueryMechanics<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>, TExtra extends Record<string, any> = {}>(
  config: QuerySliceConfig<M, F, TExtra>,
) {
  const filters = config.filters;

  // ─── Single build loop — resolve everything once ──────────────────────────
  const resolvedComponentMap: Record<string, React.ComponentType<any>> = { ...(config.componentMap ?? {}) };
  const resolvedTypeMap: Record<string, string> = {};
  const cachedComponentMap: Record<string, React.ComponentType<any> | undefined> = {};
  const cachedMetaMap: Record<string, TExtra> = {};
  const cachedDefaultMap: Record<string, any> = {};
  const resolvers: Record<string, FilterResolvers> = {};

  const iq = config.initialQuery as Record<string, any> | undefined;

  for (const [id, def] of Object.entries(filters)) {
    // Type resolution — component ref or map key
    if (typeof def.type !== "string") {
      const key = `__custom_${id}`;
      resolvedComponentMap[key] = def.type as React.ComponentType<any>;
      resolvedTypeMap[id] = key;
    } else {
      resolvedTypeMap[id] = def.type;
    }

    // Component — resolved from the type key
    cachedComponentMap[id] = resolvedComponentMap[resolvedTypeMap[id]];

    // Meta — TExtra fields (everything except functional keys)
    const meta: Record<string, any> = {};
    for (const key of Object.keys(def)) {
      if (!DEFINITION_KEYS.has(key)) {
        meta[key] = (def as Record<string, any>)[key];
      }
    }
    cachedMetaMap[id] = meta as TExtra;

    // Default value — initialQuery overrides def.value
    cachedDefaultMap[id] = iq && id in iq ? iq[id] : def.value;

    // Pre-resolve predicates and props — typeof check happens once here, never at call time
    const hiddenVal = def.hidden;
    const hiddenFn: FilterResolvers["hidden"] = typeof hiddenVal === "function" ? hiddenVal : () => (hiddenVal as boolean) ?? false;

    const disabledVal = def.disabled;
    const disabledFn: FilterResolvers["disabled"] = typeof disabledVal === "function" ? disabledVal : () => (disabledVal as boolean) ?? false;

    const propsVal = def.props;
    const propsFn: FilterResolvers["props"] =
      typeof propsVal === "function" ? (propsVal as (query: Record<string, any>) => Record<string, any>) : () => (propsVal as Record<string, any>) ?? {};

    resolvers[id] = { hidden: hiddenFn, disabled: disabledFn, props: propsFn };
  }

  // ─── Build commit function (Rule 1: resolve config at build time) ──────────
  function createCommit(hive: IHive<QueryRecord<F>>) {
    const write = (q: QueryRecord<F>) => {
      if (q === hive.honey) return;
      hive.setHoney(q);
    };

    if (!config.onQueryChange) return write;

    const onChange = config.onQueryChange;

    if (!config.debounce) {
      return (q: QueryRecord<F>) => {
        if (q === hive.honey) return;
        hive.setHoney(q);
        onChange(q);
      };
    }

    const delay = config.debounce;
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (q: QueryRecord<F>) => {
      if (q === hive.honey) return;
      hive.setHoney(q);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => onChange(hive.honey), delay);
    };
  }

  // ─── Derive initial state from cached defaults ─────────────────────────────
  function deriveInitial(): QueryRecord<F> {
    return { ...cachedDefaultMap } as QueryRecord<F>;
  }

  return {
    filters,
    resolvedComponentMap,
    cachedComponentMap,
    cachedMetaMap,
    cachedDefaultMap,
    resolvedTypeMap,
    resolvers,
    createCommit,
    deriveInitial,
  };
}
