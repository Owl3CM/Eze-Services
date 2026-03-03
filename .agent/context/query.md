# QuerySlice

## Config

`QuerySliceConfig<M, F, TExtra>`:

- `componentMap: M` — maps filter type names to React components
- `filters: F` — filter definitions (see below), with config-level typed predicates
- `debounce?: number` — debounces `onQueryChange` notifications (hive updates immediately)
- `initialQuery?` — pre-populate query state (merged on top of filter `value` fields)
- `onQueryChange?` — callback fired on every query mutation (after debounce if configured)

## FilterDefinition<M, TExtra>

Carries only **functional** fields. UI metadata goes in `TExtra`.

| Field      | Type                            | Purpose                                             |
| ---------- | ------------------------------- | --------------------------------------------------- |
| `type`     | `keyof M \| ComponentType`      | Which component to render (required)                |
| `value`    | `any`                           | Per-filter initial/default value                    |
| `hidden`   | `boolean \| (query) => boolean` | Tracked in query state but not rendered             |
| `disabled` | `boolean \| (query) => boolean` | Rendered but interaction blocked                    |
| `props`    | `Record \| (query) => Record`   | Component-specific pass-through (static or dynamic) |

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

## QueryAPI Methods

| Method             | Signature               | Description                                                  |
| ------------------ | ----------------------- | ------------------------------------------------------------ |
| `getParam`         | `(key) => any`          | Read single query param                                      |
| `getQuery`         | `() => QueryRecord`     | Read full query object                                       |
| `setQuery`         | `(q) => void`           | Replace entire query                                         |
| `updateQuery`      | `({id, value}) => void` | Update one param (skips no-ops)                              |
| `updateMany`       | `(patches[]) => void`   | Batch update — single hive notification                      |
| `removeParam`      | `(key) => void`         | Remove a param                                               |
| `clearQuery`       | `() => void`            | Clear all params (empty query)                               |
| `resetQuery`       | `() => void`            | Reset ALL to initial state (def.value + initialQuery merged) |
| `resetFilter`      | `(key) => void`         | Reset ONE filter to default (initialQuery > def.value)       |
| `listenToQuery`    | `(cb) => unsubscribe`   | Fires immediately with current value, then on each change    |
| `getFilterEntries` | `() => FilterEntry[]`   | All filters as ready-to-render entries                       |

## Filter Dependencies

No special API — `disabled`, `hidden`, and `props` as functions handle all cases:

| Scenario                     | How                                                             |
| ---------------------------- | --------------------------------------------------------------- |
| Disable until dependency set | `disabled: (q) => !q.country`                                   |
| API-dependent options        | `props: (q) => ({ paginator: createCityPaginator(q.country) })` |
| Cascade (clear on change)    | `props: (q) => ({ key: q.country })` — React re-mounts          |
| Conditional visibility       | `hidden: (q) => q.role !== "admin"`                             |
| Conditional options          | `props: (q) => ({ options: getOptionsFor(q.type) })`            |

## createQueryFilter (in `Ui/Query/`)

Adapter factory — wraps any component into a query-compatible filter:

```typescript
createQueryFilter(Component, {
  valueProp: "value",
  changeProp: "onChange",
  debounce: 300,
  transform: (v) => v,
  extraProps: {},
});
```

## Source Files

| File              | Path                                 |
| ----------------- | ------------------------------------ |
| QuerySlice logic  | `lib/Slices/Query/QuerySlice.ts`     |
| QueryMechanics    | `lib/Slices/Query/QueryMechanics.ts` |
| Query types       | `lib/Slices/Query/Types.ts`          |
| createQueryFilter | `lib/Ui/Query/createQueryFilter.tsx` |
