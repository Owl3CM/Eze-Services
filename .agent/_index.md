# Eze-Factory

**Purpose:** Architecture framework — factory pattern + slices + hives + validation
**Philosophy:** Strict separation: **Logic (pure TS) ↔ UI (React)**

## Quick Map

| Concept     | Description                                             |
| ----------- | ------------------------------------------------------- |
| **Hive**    | Reactive state container (like atoms/signals) — pure TS |
| **Bee**     | React connector: children-as-function pattern           |
| **Slice**   | Pure TS logic module — returns hives + actions          |
| **Factory** | DI container: `.use(SliceA()).use(SliceB()).build()`    |
| **Preset**  | Pre-configured factory recipe (List, Table, Detail)     |

## Area Guide — Read Only What You Need

| Working on...              | Read this              |
| -------------------------- | ---------------------- |
| Honey / Bee components     | `context/bees.md`      |
| Hive creators / interfaces | `context/hives.md`     |
| React hooks                | `context/hooks.md`     |
| createFactory / presets    | `context/factory.md`   |
| Built-in slices (overview) | `context/slices.md`    |
| QuerySlice (deep dive)     | `context/query.md`     |
| Validator                  | `context/validator.md` |
| UI components              | `context/ui.md`        |

> **Need everything?** Read all `context/*.md` files — each is self-contained, no cross-dependencies.

## API Surface

Entry point: `lib/index.ts` (barrel export)

**Hive Namespace:** `Hive.state`, `Hive.list`, `Hive.observer`, `Hive.proxy`, `Hive.form`
**Bee Components:** `Honey` (.Field, .List, .Cluster) · `Bee` (.Field, .Proxy, .Cluster)
**Hooks (6):** `useHoney`, `useHive`, `useFormField`, `useForm`, `useProxy`, `useCluster`
**Slices (8):** Query, Status, Table, Flow, Form, Paginator, Loader, Exporter
**OperationHandler:** `OperationHandler`, `OperationHandlerFactory`, `resolveHandler`, `defaultOperationHandler`, `defaultReadyHandler`, `noopHandler`
**Presets (4):** `createListFactory`, `createTableFactory`, `createDetailFactory`, `createStaticTableFactory`
**Validator:** `Validator` builder
**UI:** StatusIndicator, LoadingIndicator, ErrorDisplay, SuccessToast, StatusGuard, ProgressBar, DefaultStatusKit, DataTableBase, FlowView, FlowIndicator, useFlowSteps, createQueryFilter, Wrapper

## Anti-Patterns

- ❌ Don't use `useState` inside a Factory — factories are not React hooks
- ❌ Don't read hive values without `Bee` or `useHoney` in React (won't re-render)
- ❌ Don't put business logic in components — it belongs in Slices
- ❌ Don't put React components or CSS in `Slices/` — they go in `Ui/`

## Source Structure

```
lib/
├── index.ts          # Barrel export
├── index.css         # Global styles
├── Bees/             # Honey, Bee (compound components)
├── Hives/            # All hive creators + Types + HiveUtils
├── Hooks/            # 7 hooks
├── Factory/          # createFactory (core engine)
├── Presets/          # 4 factory recipes (List, Table, Detail, StaticTable)
├── Slices/           # Pure TS only — no React imports
│   ├── Query/        # QuerySlice, QueryMechanics
│   ├── Flow/         # FlowSlice, FlowMechanics
│   ├── Table/        # TableSlice, TableMechanics
│   ├── Status/       # StatusSlice (statusKit required, no default)
│   ├── Form/         # FormSlice
│   ├── Paginator/    # PaginatorSlice
│   ├── Loader/       # LoaderSlice
│   ├── Exporter/     # ExporterSlice
│   └── OperationHandler.ts  # Handler abstraction + resolveHandler utility
├── Ui/               # React components + co-located CSS
│   ├── Query/        # createQueryFilter
│   ├── Flow/         # FlowView, FlowIndicator, useFlowSteps
│   ├── Table/        # DataTableBase, TableBody/Head/Row/Footer, Columns
│   ├── Status/       # StatusIndicator + convenience components, DefaultStatusKit
│   └── Wrappers/     # Wrapper
├── Validator/        # Validator builder
└── Utils/            # TimedCallback, ExtractId/Value
```

## Refactoring

Active refactor tasks tracked in `.agent/refactor-tasks.md` — T1–T14 + T16–T17 + T19–T22 complete, **T15, T18, T23 open**.

## Testing

```bash
pnpm test           # Vitest — 229 tests (~1s)
npx tsc --noEmit    # Type check
```
