# UI Components

## Status Components (`Ui/Status/`)

| Export              | Purpose                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `StatusIndicator`   | Generic status display — renders component from StatusKit by priority                                |
| `LoadingIndicator`  | Convenience — scoped to `loading` status type                                                        |
| `ErrorDisplay`      | Convenience — scoped to `error` status type                                                          |
| `SuccessToast`      | Convenience — scoped to `success` status type                                                        |
| `StatusGuard`       | Conditional render: show fallback while blocking status is active                                    |
| `ProgressBar`       | Shows progress from status props                                                                     |
| `StatusComponents`  | Namespace object grouping all 6 status components                                                    |
| `DefaultStatusKit`  | Default status → component map (`error`, `processing`, `loading`, `noContent`, `empty`, `reloading`) |
| `StatusError`       | Default error UI component                                                                           |
| `StatusLoading`     | Default loading UI component                                                                         |
| `StatusLoader`      | Default loader UI component                                                                          |
| `StatusNoContent`   | Default empty/no-content UI component                                                                |
| `StatusProgressing` | Default processing UI component                                                                      |

## Flow Components (`Ui/Flow/`)

| Export          | Purpose                          |
| --------------- | -------------------------------- |
| `FlowView`      | Multi-step wizard/stepper layout |
| `FlowIndicator` | Step progress indicator          |
| `useFlowSteps`  | Hook for flow step navigation    |

## Table Components (`Ui/Table/`)

| Export                | Purpose                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `DataTableBase`       | Orchestrator — wires hives, sorting, selection; delegates to 4 builders          |
| `createTableCell`     | Adapter — wraps React component into a `CellFunction` for cellMap                |
| `BrandedCellFunction` | Phantom type carrying passthrough props for `TypedCellProps` extraction          |
| `StandardCells`       | 5 default cells: `TextCell`, `DateCell`, `MoneyCell`, `StatusCell`, `ActionCell` |

Builder pattern: `DataTableBase` accepts `headBuilder`, `rowBuilder`, `footerBuilder`, `emptyBuilder` props. The DS project provides its own builders (e.g. `DSTableHead`, `DSTableRow`) via a wrapping `DataTable` component.

The default head renders `renderHeader(table)` when a custom header was resolved; otherwise it safely falls back to the column's `header`, then `id`.

## Query Components (`Ui/Query/`)

| Export              | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `createQueryFilter` | Adapter factory — wraps component into a filter |

## Wrapper (`Ui/Wrappers/`)

| Export    | Purpose                                                                |
| --------- | ---------------------------------------------------------------------- |
| `Wrapper` | Scroll container with pull-to-refresh, infinite scroll, status overlay |

### Wrapper Props (`IWrapperProps`)

`id`, `service`, `className`, `children`, `reloader`, `subscribeToStatus`, `canLoadHive`, `statusHive`, `statusKit`, `reloaderProps`, `loadMore`, `reload`, `style`, `rememberScrollPosition`, `isScrollPositionTopHive`

## Source Files

| File              | Path                                     |
| ----------------- | ---------------------------------------- |
| StatusIndicator   | `lib/Ui/Status/StatusIndicator.tsx`      |
| StatusDefaults    | `lib/Ui/Status/StatusDefaults.ts`        |
| FlowView          | `lib/Ui/Flow/FlowView.tsx`               |
| FlowIndicator     | `lib/Ui/Flow/FlowIndicator.tsx`          |
| useFlowSteps      | `lib/Ui/Flow/useFlowSteps.ts`            |
| DataTableBase     | `lib/Ui/Table/DataTableBase.tsx`         |
| createTableCell   | `lib/Ui/Table/createTableCell.tsx`       |
| StandardCells     | `lib/Ui/Table/Columns/StandardCells.tsx` |
| createQueryFilter | `lib/Ui/Query/createQueryFilter.tsx`     |
| Wrapper           | `lib/Ui/Wrappers/Wrapper.tsx`            |
| Wrapper types     | `lib/Ui/Wrappers/types.ts`               |
