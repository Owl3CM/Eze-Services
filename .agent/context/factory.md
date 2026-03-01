# Factory System

## Core API

```typescript
import { createFactory } from "eze-factory";

const ctx = createFactory().use(SliceA()).use(SliceB()).build();
```

**Types:** `Slice<T,Ctx>`, `Factory<Ctx>`, `SliceConfig`, `SliceFactory`

## Factory Presets (4)

| Factory                    | Includes                                      | Use Case             |
| -------------------------- | --------------------------------------------- | -------------------- |
| `createTableFactory`       | Status + Query + Paginator + Table + Exporter | Data tables (CRUD)   |
| `createListFactory`        | Status + Query + Paginator                    | Paginated lists      |
| `createDetailFactory`      | Status + Query + Loader                       | Detail views         |
| `createStaticTableFactory` | Status + Table + Exporter                     | Non-paginated tables |

Shared config type: `FactoryQueryConfig<M>`.

## Source Files

| File                     | Path                                         |
| ------------------------ | -------------------------------------------- |
| createFactory            | `lib/Factory/factory.ts`                     |
| Factory types            | `lib/Factory/types.ts`                       |
| createTableFactory       | `lib/System/Factories/TableFactory.ts`       |
| createListFactory        | `lib/System/Factories/ListFactory.ts`        |
| createDetailFactory      | `lib/System/Factories/DetailFactory.ts`      |
| createStaticTableFactory | `lib/System/Factories/StaticTableFactory.ts` |
| Preset types             | `lib/System/Factories/Types.ts`              |
