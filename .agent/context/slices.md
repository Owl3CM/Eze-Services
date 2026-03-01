# Built-in Slices (8)

| Slice            | Purpose                                     | Key API                                  |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| `StatusSlice`    | `idle/loading/success/error` per-operation  | `ctx.status.operation('save').loading()` |
| `QuerySlice`     | Filter state + adapter pattern + debounce   | `ctx.query.updateQuery({id, value})`     |
| `PaginatorSlice` | Data fetching loops: load, nextPage, reload | `ctx.paginator.reload()`                 |
| `TableSlice`     | Column visibility, selection, sorting       | `ctx.table.toggleColumn('col')`          |
| `ExporterSlice`  | CSV/Excel export from table data            | `ctx.exporter.export()`                  |
| `FlowSlice`      | Multi-step wizard/stepper state             | `ctx.flow.next()`, `ctx.flow.prev()`     |
| `FormSlice`      | Form state management                       | `ctx.form.submit()`                      |
| `LoaderSlice`    | Single-item detail loading                  | `ctx.loader.load(id)`                    |

Each slice exports its own types. Some have sub-components (e.g. `Query/Components/`).

> For QuerySlice deep dive → read `query.md`

## Source Files

| File           | Path                           |
| -------------- | ------------------------------ |
| StatusSlice    | `lib/System/Slices/Status/`    |
| QuerySlice     | `lib/System/Slices/Query/`     |
| PaginatorSlice | `lib/System/Slices/Paginator/` |
| TableSlice     | `lib/System/Slices/Table/`     |
| ExporterSlice  | `lib/System/Slices/Exporter/`  |
| FlowSlice      | `lib/System/Slices/Flow/`      |
| FormSlice      | `lib/System/Slices/Form/`      |
| LoaderSlice    | `lib/System/Slices/Loader/`    |
