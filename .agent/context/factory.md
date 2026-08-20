# Factory System

## Core API

```typescript
import { createFactory } from "eze-factory";

// Pure TS — use in non-React contexts
const ctx = createFactory().use(SliceA()).use(SliceB()).build();

// React — memoized via useRef, stable across re-renders
const ctx = createFactory().use(SliceA()).use(SliceB()).useBuild();
```

> **Convention:** Factory creator functions that use `.useBuild()` must be named `use*` (e.g. `useLoaderDataFactory`) to signal React hook usage. Always call at the top level of a component.

**Types:** `Slice<T,Ctx>`, `Factory<Ctx>`, `SliceConfig`, `SliceFactory`

## Factory Presets (4)

| Factory                    | Includes                                      | Use Case             |
| -------------------------- | --------------------------------------------- | -------------------- |
| `createTableFactory`       | Status + Query + Paginator + Table + Exporter | Data tables (CRUD)   |
| `createListFactory`        | Status + Query + Paginator                    | Paginated lists      |
| `createDetailFactory`      | Status + Query + Loader                       | Detail views         |
| `createStaticTableFactory` | Status + Query + Loader + Table + Exporter    | Non-paginated tables |

### Preset Operation Defaults

Presets inject default operation names for their internal slices so StatusSlice integration works automatically:

| Preset                     | Slice          | Default `operation` |
| -------------------------- | -------------- | ------------------- |
| `createListFactory`        | PaginatorSlice | `"paginator"`       |
| `createTableFactory`       | PaginatorSlice | `"paginator"`       |
| `createDetailFactory`      | LoaderSlice    | `"loader"`          |
| `createStaticTableFactory` | LoaderSlice    | `"loader"`          |

Users can override by passing `operation` in the slice config:

```ts
createListFactory({
  status: { statusKit: DSStatusKit },
  paginator: { ...paginatorConfig, operation: "product-list" },
});
```

Extract preset config type: `PresetConfig<F>` (e.g. `PresetConfig<typeof createTableFactory>`).

## Factory Interfaces

From `Presets/Types.ts` — used to type the factory context in consuming code:

| Interface              | Context key |
| ---------------------- | ----------- |
| `IStatusFactory<K>`    | `status`    |
| `IQueryFactory<M>`     | `query`     |
| `IPaginatorFactory<T>` | `paginator` |
| `ILoaderFactory<R>`    | `loader`    |
| `ITableFactory<T>`     | `table`     |
| `IExporterFactory`     | `exporter`  |

## Source Files

| File                     | Path                                |
| ------------------------ | ----------------------------------- |
| createFactory            | `lib/Factory/factory.ts`            |
| Factory types            | `lib/Factory/types.ts`              |
| createTableFactory       | `lib/Presets/TableFactory.ts`       |
| createListFactory        | `lib/Presets/ListFactory.ts`        |
| createDetailFactory      | `lib/Presets/DetailFactory.ts`      |
| createStaticTableFactory | `lib/Presets/StaticTableFactory.ts` |
| Preset types             | `lib/Presets/Types.ts`              |
| Barrel export            | `lib/Presets/index.ts`              |
