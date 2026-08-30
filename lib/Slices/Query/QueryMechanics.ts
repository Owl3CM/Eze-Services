import { IHive } from "../../Hives";
import { FilterDefinition, QueryComponentMap, QueryRecord, QuerySliceConfig } from "./Types";

/** All resolved data for a single filter — built once at construction. */
export type ResolvedFilter<TExtra extends Record<string, any> = Record<string, any>> = {
  type: string;
  component: React.ComponentType<any> | undefined;
  meta: TExtra;
  defaultValue: any;
  required: boolean;
  hidden: (query: Record<string, any>) => boolean;
  disabled: (query: Record<string, any>) => boolean;
  props: (query: Record<string, any>) => Record<string, any>;
};

/**
 * Builds the heavy parts at construction time:
 * - Resolves component registration (type = Component → map key)
 * - Builds the commit function (debounced or direct)
 * - Consolidates all per-filter data into a single ResolvedFilter record
 * - Pre-resolves predicates and props into closures (zero typeof at call time)
 * - Computes initial/default state
 *
 * Does NOT own state or API — that's the slice's job.
 */
export function createQueryMechanics<M extends QueryComponentMap, F extends Record<string, FilterDefinition<M>>, TExtra extends Record<string, any> = {}>(
  config: QuerySliceConfig<M, F, TExtra>,
) {
  const filters = config.filters;

  // ─── Build: resolve everything once per filter ──────────────────────────────
  const componentMap: Record<string, React.ComponentType<any>> = { ...(config.componentMap ?? {}) };
  const resolved: Record<string, ResolvedFilter<TExtra>> = {};

  const iq = config.initialQuery as Record<string, any> | undefined;

  for (const [id, def] of Object.entries(filters)) {
    // Type resolution — component ref or map key
    let typeKey: string;
    if (typeof def.type !== "string") {
      typeKey = `__custom_${id}`;
      componentMap[typeKey] = def.type as React.ComponentType<any>;
    } else {
      typeKey = def.type;
    }

    // Meta — exhaustive extraction via destructure + spread (R2)
    const { type: _type, value: _value, required: _required, hidden: hiddenVal, disabled: disabledVal, props: propsVal, ...meta } = def as Record<string, any>;

    // Pre-resolve predicates — typeof check happens once here, never at call time
    const hiddenFn = typeof hiddenVal === "function" ? hiddenVal : () => (hiddenVal as boolean) ?? false;
    const disabledFn = typeof disabledVal === "function" ? disabledVal : () => (disabledVal as boolean) ?? false;
    const propsFn =
      typeof propsVal === "function" ? (propsVal as (query: Record<string, any>) => Record<string, any>) : () => (propsVal as Record<string, any>) ?? {};

    resolved[id] = {
      type: typeKey,
      component: componentMap[typeKey],
      meta: meta as TExtra,
      defaultValue: iq && id in iq ? iq[id] : def.value,
      required: !!def.required,
      hidden: hiddenFn,
      disabled: disabledFn,
      props: propsFn,
    };
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

  // ─── Derive initial state from resolved defaults ───────────────────────────
  function deriveInitial(): QueryRecord<F> {
    const initial: Record<string, any> = {};
    for (const [id, r] of Object.entries(resolved)) {
      initial[id] = r.defaultValue;
    }
    return initial as QueryRecord<F>;
  }

  return {
    filters,
    componentMap,
    resolved,
    createCommit,
    deriveInitial,
  };
}
