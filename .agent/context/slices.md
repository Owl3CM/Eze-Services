# Built-in Slices (8)

| Slice            | Purpose                                     | Key API                                   |
| ---------------- | ------------------------------------------- | ----------------------------------------- |
| `StatusSlice`    | `idle/loading/success/error` per-operation  | `ctx.status.operation('save').loading()`  |
| `QuerySlice`     | Filter state + adapter pattern + debounce   | `ctx.query.updateQuery({id, value})`      |
| `PaginatorSlice` | Data fetching loops: load, nextPage, reload | `ctx.paginator.reload()`                  |
| `TableSlice`     | Column visibility, selection, sorting       | `ctx.table.toggleColumnVisibility('col')` |
| `ExporterSlice`  | CSV/Excel export from table data            | `ctx.exporter.download({ type: 'csv' })`  |
| `FlowSlice`      | Multi-step wizard/stepper state             | `ctx.flow.next()`, `ctx.flow.back()`      |
| `FormSlice`      | Form state management                       | `ctx.form.submit()`                       |
| `LoaderSlice`    | Single-item detail loading                  | `ctx.loader.load(id)`                     |

Each slice exports its own types. Some have sub-components in `Ui/`.

> For QuerySlice deep dive → read `query.md`

## Architecture Rules

### Rule 1: Build Clean, Run Lean

Mechanics must resolve all configuration at construction. If config says `debounce: 300`, the mechanic builds a debounced setter. If absent, it builds a direct setter. **At runtime: zero conditions for config-driven behavior — just call the pre-built function.**

### Rule 2: Mechanics Are Internal, Slices Are Composable

Only slices plug into the factory. Mechanics are private to their slice — they organize logic but don't compose or plug into anything. Mechanics own their state and expose clean methods. Slices own composition and expose the public API.

### Rule 3: Balanced Load

Mechanics takes PART of the load — the heavy computation (build-time resolution, validation, component registration). The slice must still have substance: it owns state (hive), composes the API, and contains the methods that use mechanics tools. **Never make the slice an empty shell.**

### When to Use a Mechanics File

| Mechanics needs...                    | Pattern                                    | Example                                                                        |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| No state (pure transforms, utilities) | Static namespace `const M = { fn1, fn2 }`  | `TableMechanics`, `PaginatorMechanics`, `LoaderMechanics`, `ExporterMechanics` |
| Captured state (hive, config)         | Closure `createXMechanics(config) => { }`  | `createQueryMechanics`, `createFlowMechanics`                                  |
| Complex state + many methods (10+)    | Class `class XMechanics { constructor() }` | (none currently)                                                               |

> **No mechanics:** StatusSlice and FormSlice have no mechanics file — their logic is simple enough to live entirely in the slice.

### Rule 4: Never Use Presets Directly

Presets (`createListFactory`, `createTableFactory`, etc.) are **generic templates**. The project MUST wrap them into `App*Factory` functions that inject project defaults (`statusKit`, `componentMap`, etc.). Direct Preset usage in feature code is forbidden.

```ts
// ❌ Direct Preset usage in a page
createTableFactory({ statusKit: DSStatusKit, query: { componentMap: appFilterMap, ... } })

// ✅ Project wrapper, then used in pages
AppTableFactory({ paginator: ..., table: ... }).build()
```

### Rule 5: Config In, Behavior On Top

To customize a Preset-internal slice:

- **Config values** (componentMap, statusKit, filters) → pass through Preset config
- **Behavioral extensions** (URL sync, auto-retry) → side-effect slices via `.use()`
- **Never wrap** a Preset-internal slice externally — it breaks subscription wiring

### Rule 6: Side-Effect Slices

A side-effect slice reads from `ctx`, adds behavior (subscriptions, listeners, timers), and returns `{}`. It does NOT create or replace existing ctx keys.

```ts
function LoggingSlice() {
  return (ctx: { query: QueryAPI }) => {
    ctx.query.listenToQuery((q) => console.log("Query changed:", q));
    return {}; // pure side-effect
  };
}
```

### Rule 7: Defaults Are Named Exports

Default kits (`DefaultStatusKit`, etc.) are **opt-in exports**, never auto-injected. The project imports and passes them explicitly, extends them, or replaces them entirely.

### Rule 8: Explicit Operation Declaration

Slices that perform async operations (FormSlice, LoaderSlice, PaginatorSlice) declare operations **explicitly** via config. They never reference `ctx.status` directly.

- **`OperationHandler`** — 4-method interface: `loading(data?)`, `error(data?)`, `idle()`, `success(data?)`
- **`OperationHandlerFactory`** — `(ctx: any) => OperationHandler`, resolved once at build time (Rule 1)
- **`defaultOperationHandler(name)`** — factory: binds to `ctx.status.operation(name)` if StatusSlice present, else noop
- **`resolveHandler(operation?, override?)`** — utility: override > auto-link from name > noop
- **`noopHandler`** — explicitly disables notifications
- **`defaultReadyHandler()`** — binds to `ctx.status.ready()` if StatusSlice present, else noop. ExporterSlice uses this as its **default fallback** (overridable via `config.operationHandler`)

```ts
// Explicit operation name — auto-links to StatusSlice
LoaderSlice({ loader: fn, operation: "product-load" });

// FormSlice — two named operations (submit + load)
FormSlice({
  initialValue: {},
  onSubmit: save,
  operations: { submit: "user-save", load: "user-load" },
});

// Custom handler override
LoaderSlice({
  loader: fn,
  operation: "product-load",
  operationHandler: () => ({
    loading: () => showToast("Loading..."),
    error: (e) => showToast(e.message, "error"),
    idle: () => {},
    success: () => {},
  }),
});

// No operations — noop, no status coupling
LoaderSlice({ loader: fn });

// UI — typed reference through ctx
<LoadingIndicator status={ctx.status} operations={[ctx.loader.operation]} />
<StatusGuard status={ctx.status} operations={[ctx.form.operations.submit]} fallback={<Skeleton />}>
```

**Presets** inject default operation names (`"paginator"`, `"loader"`) so Preset-based usage retains status integration automatically.

## Source Files

| File             | Path                             |
| ---------------- | -------------------------------- |
| StatusSlice      | `lib/Slices/Status/`             |
| QuerySlice       | `lib/Slices/Query/`              |
| PaginatorSlice   | `lib/Slices/Paginator/`          |
| TableSlice       | `lib/Slices/Table/`              |
| ExporterSlice    | `lib/Slices/Exporter/`           |
| FlowSlice        | `lib/Slices/Flow/`               |
| FormSlice        | `lib/Slices/Form/`               |
| LoaderSlice      | `lib/Slices/Loader/`             |
| OperationHandler | `lib/Slices/OperationHandler.ts` |

---

## Table System (Deep Dive)

> For QuerySlice deep dive → read `query.md`

### TableSliceConfig

```typescript
{
  columns: (ctx: Ctx) => TableColumnInput<M, TItem>[];
  cellMap?: M;              // Maps type names → cell functions (via createTableCell)
  showCheckBox?: boolean;   // Default: false
  showIndex?: boolean;      // Default: true (opt-out via false)
  toggleColumnsBtnVisible?: boolean;  // Default: true
  storeKey?: string;        // localStorage key prefix
  idKey?: string;           // Row identity field. Default: "id"
  restoreFromStore?: boolean; // Default: true — restore column visibility from localStorage
}
```

### TableColumnDef

| Field             | Type                                       | Purpose                                            |
| ----------------- | ------------------------------------------ | -------------------------------------------------- |
| `id`              | `string`                                   | Column key — matches data field name               |
| `type`            | `string?`                                  | CellMap key — resolves to a cell function          |
| `header`          | `string?`                                  | Column header text                                 |
| `headerComponent` | `(table: TableAPI) => ReactNode`           | Custom header renderer                             |
| `renderHeader`    | `(table: TableAPI) => ReactNode`           | Set by Mechanics only when `headerComponent` exists |
| `visible`         | `boolean?`                                 | Column visibility. Default: `true`                 |
| `cell`            | `CellFunction<T>?`                         | Direct cell renderer — overrides cellMap           |
| `props`           | `Record<string, any>?`                     | Passed through to the cell component               |
| `resolve`         | `(item, col) => Record<string, any>`       | Per-row prop resolver — baked into cell at init    |
| `hideOnPrint`     | `boolean?`                                 | Hide column in print view                          |
| `export`          | `{ value, calcTotal?, width?, getStyle? }` | Export configuration                               |

### CellFunction Signature

```typescript
type CellFunction<T> = (item: T, col: TableColumnDef<T>, meta: { index: number }) => React.ReactNode;
```

Cell receives the full column definition — can access `col.id`, `col.props`, everything. No closures needed.

### CellMap + createTableCell Adapter

Same architecture as Query's `componentMap`:

```typescript
// 1. Wrap components into cell functions
const cellMap = {
  money: createTableCell(MoneyCell),
  date: createTableCell(DatePicker, { valueProp: "date", transform: (v) => new Date(v) }),
};

// 2. Columns reference by type name
columns: () => [
  { id: "salary", type: "money", props: { currency: "SAR" } },
  { id: "joined", type: "date" },
];
```

`createTableCell` returns a `BrandedCellFunction` with phantom type for compile-time `props` validation via `TypedCellProps` / `TableColumnInput<M>`.

### TableMechanics (Static Namespace)

| Namespace   | Methods                                                  | Purpose                        |
| ----------- | -------------------------------------------------------- | ------------------------------ |
| `Storage`   | `saveColumns`, `getColumns`, `clearColumns`              | localStorage persistence       |
| `Sorting`   | `sortRows`                                               | Multi-key sort with nulls-last |
| `Columns`   | `initialize`, `setVisible`                               | Column resolution + visibility |
| `Selection` | `toggle`, `isAllSelected`, `selectAll`, `isItemSelected` | Selection logic                |

`Columns.initialize` resolves at build time: cellMap → cell function, custom `headerComponent` → `renderHeader`, `resolve` → baked cell. `DataTableBase` falls back to `header` (then `id`) when no custom renderer exists.

### TableAPI

**Hives:** `columnsHive`, `selectedItemsHive`, `sortingHive`, `isAllSelectedHive` (observer)

**Column methods:** `setVisibleColumns`, `getVisibleColumns`, `toggleColumnVisibility`, `toggleAllColumns`, `resetColumns`

**Selection methods:** `setSelected`, `toggleItemSelection`, `toggleAllItemsSelection`, `selectAllItems`, `unselectAllItems`, `isAllSelected`, `isItemSelected`

**Sorting methods:** `setSorting`, `clearSorting`, `addSort`

**Data methods:** `getRawRows`, `getFilteredRows`, `getSortedRows`, `getViewRows`

**Other:** `getExportColumns`, `storeKey`, `showIndex`, `showCheckBox`, `toggleColumnsBtnVisible`

### Builder Interfaces

`DataTableBase` delegates rendering to 4 builder components:

| Builder Prop    | Props Interface            | Purpose          |
| --------------- | -------------------------- | ---------------- |
| `headBuilder`   | `TableHeadBuilderProps<T>` | Table header     |
| `rowBuilder`    | `TableRowBuilderProps<T>`  | Individual rows  |
| `footerBuilder` | `TableFooterBuilderProps`  | Footer with slot |
| `emptyBuilder`  | `TableEmptyBuilderProps`   | Empty state      |

DS projects provide their own builders via a wrapping component (e.g. `DataTable` in the project).
