# QuerySlice

## Config

`QuerySliceConfig<M, F, TExtra>`:

- `componentMap: M` — maps filter type names to React components
- `filters: F` — filter definitions (see below), with config-level typed predicates
- `debounce?: number` — debounces `onQueryChange` notifications (hive updates immediately)
- `initialQuery?` — pre-populate query state (merged on top of filter `value` fields)
- `onQueryChange?` — callback fired on every query mutation (after debounce if configured)
- `engine?: QueryEngine` — external state engine (URL router, localStorage, etc.). When provided, all mutations go through engine.set, engine.subscribe → hive

## FilterDefinition<M, TExtra>

Carries only **functional** fields. UI metadata goes in `TExtra`.

| Field       | Type                                              | Purpose                                                                                                      |
| ----------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `type`      | `keyof M \| (string & {}) \| React.ComponentType` | Which component to render (required). `(string & {})` allows arbitrary strings while preserving autocomplete |
| `value?`    | `any`                                             | Per-filter initial/default value                                                                             |
| `required?` | `boolean`                                         | When true, `clearQuery`/`removeParam` preserve the default                                                   |
| `hidden?`   | `boolean \| (query) => boolean`                   | Tracked in query state but not rendered                                                                      |
| `disabled?` | `boolean \| (query) => boolean`                   | Rendered but interaction blocked                                                                             |
| `props?`    | `Record \| (query) => Record`                     | Component-specific pass-through (static or dynamic)                                                          |

All fields except `type` are optional.

**`hidden` / `disabled` predicates:** When a function, evaluated on every `getFilterEntries()` call with the current query state. The `query` parameter has typed filter keys at the config level (via `StrictQueryRecord<F>`).

**Dynamic `props`:** When a function, evaluated with current query. Enables filter dependencies (e.g., city options depend on country value) and cascade via React `key` prop.

`TExtra` is a project-level intersection for UI metadata:

```ts
type AppFilterMeta = { label?: string; placement?: "InLine" | "InPopup" | "Auto" };
type AppFilter = FilterDefinition<AppFilterMap, AppFilterMeta>;
```

## FilterEntry<TMeta>

Returned by `getFilterEntries()`. Ready-to-render snapshot with all predicates and props resolved:

| Field          | Type                         | Source                                        |
| -------------- | ---------------------------- | --------------------------------------------- |
| `id`           | `string`                     | Filter key                                    |
| `type`         | `string`                     | Resolved component map key                    |
| `value`        | `any`                        | Current value from hive                       |
| `defaultValue` | `any`                        | Reset-target value (initialQuery > def.value) |
| `hidden`       | `boolean`                    | Resolved (static or computed)                 |
| `disabled`     | `boolean`                    | Resolved (static or computed)                 |
| `Component`    | `ComponentType \| undefined` | Resolved from componentMap                    |
| `props`        | `Record<string, any>`        | Resolved (static or computed)                 |
| `meta`         | `TMeta`                      | TExtra fields from definition                 |

`FilterEntry.id` is `IdOf<F>` — a typed union of filter keys (when `F` is concrete). Static fields (`type`, `Component`, `meta`) are cached at build time. Only `hidden`, `disabled`, and `props` re-evaluate per `getFilterEntries()` call.

## QueryAPI

### Properties

| Property       | Type                    | Description                                                                           |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `filters`      | `ResolvedFilters<M, F>` | The filter definitions (resolved mapped type — includes registered custom components) |
| `queryHive`    | `IHive<QueryRecord<F>>` | Reactive hive holding the current query state                                         |
| `componentMap` | `M`                     | The component map (includes registered custom components)                             |

### Methods

| Method              | Signature                          | Description                                                        |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `getParam`          | `(key) => any`                     | Read single query param                                            |
| `getQuery`          | `() => QueryRecord`                | Read full query object                                             |
| `setQuery`          | `(q) => void`                      | Replace entire query                                               |
| `updateQuery`       | `({id, value}) => void`            | Update one param (skips no-ops)                                    |
| `updateMany`        | `(patches[]) => void`              | Batch update — single hive notification                            |
| `removeParam`       | `(key) => void`                    | Remove a param (required filters restore default instead)          |
| `removeMany`        | `(keys[]) => void`                 | Remove multiple params atomically (required filters keep defaults) |
| `clearQuery`        | `() => void`                       | Clear all params (required filters preserve their defaults)        |
| `resetQuery`        | `() => void`                       | Reset ALL to initial state (def.value + initialQuery merged)       |
| `resetFilter`       | `(key) => void`                    | Reset ONE filter to default (initialQuery > def.value)             |
| `isDirty`           | `() => boolean`                    | True if current query differs from initial state                   |
| `activeFilterCount` | `() => number`                     | Count of params with a defined (non-undefined) value               |
| `listenToQuery`     | `(cb) => unsubscribe`              | Fires immediately with current value, then on each change          |
| `getFilterEntries`  | `() => ReadonlyArray<FilterEntry>` | All filters as ready-to-render entries (read-only array)           |
| `dispose`           | `() => void`                       | Idempotently unsubscribe and dispose the external engine           |

## Builders

### `createQuerySlice<M, TExtra>(componentMap)`

Primary builder — curried factory that locks `componentMap` and `TExtra`, then infers `F` (filter keys) from each call's `filters` object. Eliminates the need for `QuerySlice<typeof map, any, Extra>` everywhere.

```ts
const query = createQuerySlice<typeof appFilterMap, AppFilterExtra>(appFilterMap);

// F is inferred from filters — getParam("search") is typed to IdOf<F>
createFactory()
  .use(
    query({
      filters: {
        search: { type: "text" },
        status: { type: "selector", props: { options } },
      },
    }),
  )
  .build();
```

The inner config accepts the same fields as `QuerySliceConfig` minus `componentMap` (already locked): `filters`, `onQueryChange?`, `debounce?`, `initialQuery?`, `engine?`.

**Type benefits:** Predicates get `StrictQueryRecord<F>` autocomplete. `FilterInput<M, TExtra>` validates `props` against each filter's component passthrough type.

### `createTypedQuerySlice<M, TExtra>(componentMap)`

Alternative builder that infers value types from the `value` field in each filter definition:

```ts
const query = createTypedQuerySlice(appFilterMap);

// getParam("search") → string | undefined (not any)
// updateQuery({ id: "search", value: 123 }) → TS error
const slice = query({
  filters: {
    search: { type: "text", value: "" }, // → string
    active: { type: "boolean", value: false }, // → boolean
  },
});
```

**Trade-off vs `createQuerySlice`**: gains typed values on API, loses predicate autocomplete and FilterInput props validation. Both builders share the same runtime — `createTypedQuerySlice` only changes the type layer. Uses `FilterBase<M>` constraint instead of `FilterInput<M, TExtra>`.

## Required Filters

Filters with `required: true` survive `clearQuery()`, `removeParam()`, and `removeMany()` — their default value is restored instead of being deleted. `resetQuery()` is NOT affected (always restores full initial state).

## Filter Dependencies

No special API — `disabled`, `hidden`, and `props` as functions handle all cases:

| Scenario                     | How                                                             |
| ---------------------------- | --------------------------------------------------------------- |
| Disable until dependency set | `disabled: (q) => !q.country`                                   |
| API-dependent options        | `props: (q) => ({ paginator: createCityPaginator(q.country) })` |
| Cascade (clear on change)    | `props: (q) => ({ key: q.country })` — React re-mounts          |
| Conditional visibility       | `hidden: (q) => q.role !== "admin"`                             |
| Conditional options          | `props: (q) => ({ options: getOptionsFor(q.type) })`            |

## Internals

### ResolvedFilter (QueryMechanics)

All per-filter data consolidated into one record at build time:

| Field        | Type                     | Description                        |
| ------------ | ------------------------ | ---------------------------------- |
| type         | `string`                 | Resolved component map key         |
| component    | `ComponentType \| undef` | Resolved component                 |
| meta         | `TExtra`                 | Extracted via destructure + spread |
| defaultValue | `any`                    | initialQuery > def.value           |
| required     | `boolean`                | From def.required                  |
| hidden       | `(q) => boolean`         | Pre-resolved closure               |
| disabled     | `(q) => boolean`         | Pre-resolved closure               |
| props        | `(q) => Record`          | Pre-resolved closure               |

### Mutation Pattern

`applyPatches()` — shared function used by `updateQuery`, `updateMany`, `removeParam`, `removeMany`. Returns new record if anything changed, null otherwise (no-op detection).

## createQueryFilter (in `Ui/Query/`)

Adapter factory — wraps any component into a query-compatible filter:

```typescript
createQueryFilter(Component, {
  valueProp: "value", // Which prop to pass the current value to (default: "value")
  changeProp: "onChange", // Which prop to listen for changes on (default: "onChange")
  debounce: 300, // Debounce delay in ms before writing to query state
  transform: (v) => v, // Transform raw component output before storing
  extraProps: {}, // Extra static props to pass to the component
  defaultValue: "", // Value when hive value is undefined (prevents uncontrolled inputs)
});
```

Options interface: `CreateQueryFilterOptions` — all fields optional.

Returns a `QueryFilterAdapter<Passthrough>` — branded type preserving passthrough prop types for `FilterDefinition.props` validation.

**Excluded props:** The adapter omits `value`, `onChange` (or custom `valueProp`/`changeProp`), `id`, `query`, `label`, and `disabled` from the passthrough type — these are managed by the adapter or the query system.

**QueryFilterProps:** Every filter adapter component receives `{ id: string; query: QueryAPI }` as props from the query rendering system.

## QueryEngine

Generic state sync engine — set + subscribe pattern. Baked directly into QuerySlice config. Replaces the old separate UrlSyncSlice.

```ts
interface QueryEngine {
  set: (params: Record<string, any>) => void;
  subscribe: (cb: (params: Record<string, any> | null) => void) => () => void;
  dispose?: () => void;
}
```

The engine speaks QuerySlice's language (`Record<string, any>`). Serialization to/from URL strings is the **project adapter's** responsibility, not the package's.

When engine is provided:

- All mutations → `engine.set(queryRecord)` instead of direct hive write
- `engine.subscribe` fires → updates hive (hive becomes a read-only mirror)
- Init: engine state seeds hive (defaults stay in hive only — not synced back to engine, prevents URL pollution)
- `query.dispose()` unsubscribes the engine listener and calls optional `engine.dispose()` exactly once

Project creates an adapter function (e.g. `createRouterEngine`) that bridges the app router into a `QueryEngine`, handling serialization internally.

## Key Exported Types

| Type                          | File                    | Purpose                                           |
| ----------------------------- | ----------------------- | ------------------------------------------------- |
| `QueryComponentMap`           | `Types.ts`              | `Record<string, ComponentType>` — component map   |
| `QueryRecord<F>`              | `Types.ts`              | `{ [K in keyof F]?: any }` — query state shape    |
| `StrictQueryRecord<F>`        | `Types.ts`              | No index sig — gives autocomplete in predicates   |
| `FilterDefinition<M, TExtra>` | `Types.ts`              | Single filter config with TExtra intersection     |
| `FilterInput<M, TExtra>`      | `Types.ts`              | Discriminated union — props validated per type    |
| `FilterEntry<TMeta, F>`       | `Types.ts`              | Ready-to-render snapshot from `getFilterEntries`  |
| `IdOf<F>`                     | `Types.ts`              | Union of filter keys extracted from `F`           |
| `QueryAPI<M, F, TMeta>`       | `Types.ts`              | Full slice API interface                          |
| `QueryEngine`                 | `Types.ts`              | External state engine interface                   |
| `ResolvedFilter<TExtra>`      | `QueryMechanics.ts`     | Internal build-time per-filter record             |
| `QueryFilterAdapter<P>`       | `createQueryFilter.tsx` | Branded FC with passthrough phantom               |
| `QueryFilterProps`            | `createQueryFilter.tsx` | `{ id: string; query: QueryAPI }` — adapter input |
| `CreateQueryFilterOptions`    | `createQueryFilter.tsx` | Adapter config (valueProp, debounce, etc.)        |

## Source Files

| File              | Path                                 |
| ----------------- | ------------------------------------ |
| QuerySlice logic  | `lib/Slices/Query/QuerySlice.ts`     |
| QueryMechanics    | `lib/Slices/Query/QueryMechanics.ts` |
| Query types       | `lib/Slices/Query/Types.ts`          |
| createQueryFilter | `lib/Ui/Query/createQueryFilter.tsx` |
