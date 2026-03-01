# QuerySlice

## Config

`QuerySliceConfig<M, F>`:

- `componentMap: M` — maps filter type names to React components
- `filters: F` — filter definitions (`type`, `label?`, `placement?`, `isMain?`, `value?`, `Element?`)
- `debounce?: number` — collapses rapid multi-filter changes
- `initialQuery?` — pre-populate query state
- `router?: { read, write }` — router DI for URL sync
- `validators?`, `onQueryChange?`

## QueryAPI Methods

| Method               | Signature                  | Description                                |
| -------------------- | -------------------------- | ------------------------------------------ |
| `getParam`           | `(key) => any`             | Read single query param                    |
| `getQuery`           | `() => QueryRecord`        | Read full query object                     |
| `setQuery`           | `(q) => void`              | Replace entire query                       |
| `updateQuery`        | `({id, value}) => boolean` | Update one param (validates, skips no-ops) |
| `updateMany`         | `(patches[]) => void`      | Batch update — single hive notification    |
| `removeParam`        | `(key) => void`            | Remove a param                             |
| `clearQuery`         | `() => void`               | Clear all params                           |
| `listenToQuery`      | `(cb) => unsubscribe`      | Subscribe to changes                       |
| `getFilterComponent` | `(type) => Component`      | Resolve component from componentMap        |
| `getFilterEntries`   | `() => FilterEntry[]`      | All filters as ready-to-render entries     |

## createQueryFilter

Adapter factory — wraps any component into a query-compatible filter:

```typescript
createQueryFilter(Component, {
  valueProp: "value", // default
  changeProp: "onChange", // default
  debounce: 300,
  transform: (v) => v,
  extraProps: {},
});
```

## Sub-Components

- `QueryContainer` — observes query hive, renders filters + children
- `Filters` — renders filter bar from `getFilterEntries()`
- `QueryElements` — filter element rendering

## Source Files

| File              | Path                                                    |
| ----------------- | ------------------------------------------------------- |
| QuerySlice logic  | `lib/System/Slices/Query/QuerySlice.ts`                 |
| QueryMechanics    | `lib/System/Slices/Query/QueryMechanics.ts`             |
| Query types       | `lib/System/Slices/Query/Types.ts`                      |
| createQueryFilter | `lib/System/Slices/Query/createQueryFilter.tsx`         |
| QueryContainer    | `lib/System/Slices/Query/Components/QueryContainer.tsx` |
| Filters           | `lib/System/Slices/Query/Components/Filters.tsx`        |
| QueryElements     | `lib/System/Slices/Query/Components/QueryElements.tsx`  |
