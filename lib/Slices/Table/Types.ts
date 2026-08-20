import React from "react";
import { IHive, IHiveObserver } from "../../Hives";
import { PaginatorAPI } from "../Paginator/Types";
import { LoaderAPI } from "../Loader/Types";

// ─── Constants ───────────────────────────────────────────────────────────────
/** Marker property on row objects to hide them from the table view. */
export const TABLE_HIDDEN_FLAG = "__table__hidden__" as const;

// ─── Cell Function ───────────────────────────────────────────────────────────
/** Universal cell renderer signature. Receives item, its column def, and row meta. */
export type CellFunction<T = any> = (item: T, col: TableColumnDef<T>, meta: { index: number }) => React.ReactNode;

// ─── Cell Map ────────────────────────────────────────────────────────────────
/** Maps cell type names to cell functions. Projects build via `createTableCell`. */
export type TableCellMap<T = any> = Record<string, CellFunction<T>>;

/** Extract passthrough props from a branded CellFunction (phantom type). Falls back to Record<string, any>. */
export type ExtractCellPassthrough<T> = T extends { readonly __passthrough?: infer P } ? (P extends undefined ? Record<string, any> : P) : Record<string, any>;

/** Per-type cell props. */
export type TypedCellProps<M extends TableCellMap, T extends keyof M> = ExtractCellPassthrough<M[T]>;

export type TableExportFn<T> = (item: T) => string | number | boolean | Date | null | undefined;

export type TableColumnDef<T> = {
  id: string;
  /** Cell type — key of the cellMap. */
  type?: string;
  header?: string;
  headerComponent?: (tableSlice: TableAPI<T>) => React.ReactNode;
  visible?: boolean;
  /** Direct cell renderer. When provided, overrides cellMap resolution. */
  cell?: CellFunction<T>;
  /** Component-specific props — passed through to the resolved cell component. */
  props?: Record<string, any>;
  /** Per-column prop resolver. When present, `resolve(item, col)` provides ALL props to the cell. */
  resolve?: (item: T, col: TableColumnDef<T>) => Record<string, any>;
  /** Pre-resolved header renderer (set by Mechanics at init). */
  renderHeader?: (table: TableAPI<T>) => React.ReactNode;
  hideOnPrint?: boolean;
  export?: {
    value: TableExportFn<T>;
    calcTotal?: boolean;
    width?: number;
    getStyle?: (item: T) => any;
  };
};

/**
 * Type-safe column input — discriminated by `type`.
 * When `type` is a key from the cell map, `props` is constrained
 * to the cell function's passthrough props (via BrandedCellFunction phantom type).
 */
export type TableColumnInput<M extends TableCellMap, T = any> =
  | {
      [K in keyof M]: Omit<TableColumnDef<T>, "type" | "props"> & {
        type: K;
        props?: TypedCellProps<M, K>;
      };
    }[keyof M]
  | (Omit<TableColumnDef<T>, "type" | "props"> & {
      cell: CellFunction<T>;
    });

export type TableSort<T> = {
  id: keyof T | string;
  dir: "asc" | "desc";
  index?: number;
};

export type TableSliceConfig<TItem, Ctx = any, M extends TableCellMap = TableCellMap> = {
  columns: (ctx: Ctx) => TableColumnInput<M, TItem>[];
  /** Cell function map — maps type names to cell functions (built via `createTableCell`). */
  cellMap?: M;
  showCheckBox?: boolean;
  showIndex?: boolean;
  toggleColumnsBtnVisible?: boolean;
  storeKey?: string;
  idKey?: string;
  restoreFromStore?: boolean;
};

export interface TableAPI<TItem> {
  columnsHive: IHive<TableColumnDef<TItem>[]>;
  selectedItemsHive: IHive<Record<string, TItem>>;
  sortingHive: IHive<TableSort<TItem>[]>;
  storeKey: string;
  showIndex: boolean;
  showCheckBox: boolean;
  toggleColumnsBtnVisible: boolean;
  isAllSelectedHive: IHiveObserver<boolean>;
  setVisibleColumns: (cols: TableColumnDef<TItem>[]) => void;
  getVisibleColumns: () => TableColumnDef<TItem>[];
  toggleColumnVisibility: (colId: string) => void;
  toggleAllColumns: (val?: boolean) => void;
  resetColumns: () => void;
  setSelected: (next: Record<string, TItem> | ((prev: Record<string, TItem>) => Record<string, TItem>)) => void;
  toggleItemSelection: (item: TItem) => void;
  toggleAllItemsSelection: () => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  isAllSelected: () => boolean;
  setSorting: (sorts: TableSort<TItem>[]) => void;
  clearSorting: () => void;
  addSort: (s: TableSort<TItem>) => void;
  getRawRows: () => TItem[];
  getFilteredRows: () => TItem[];
  getSortedRows: () => TItem[];
  getViewRows: (applySorting?: boolean) => TItem[];
  getExportColumns: () => TableColumnDef<TItem>[];
  isItemSelected: (item: TItem) => boolean;
}

// Union type for data source - either Paginator or Loader
export type TableDataSource<TItem> = { paginator: PaginatorAPI<TItem>; loader?: never } | { loader: LoaderAPI<TItem[]>; paginator?: never };

export type TableDependencies<TItem> = TableDataSource<TItem>;

// ── Builder Interfaces (shared contract between mechanism and DS) ──

export interface TableHeadBuilderProps<T> {
  columns: TableColumnDef<T>[];
  sorting: TableSort<T>[];
  onSort: (colId: string) => void;
  showCheckBox: boolean;
  showIndex: boolean;
  isAllSelected: boolean;
  onToggleAll: () => void;
  table: TableAPI<T>;
}

export interface TableRowBuilderProps<T> {
  item: T;
  index: number;
  columns: TableColumnDef<T>[];
  isSelected: boolean;
  showCheckBox: boolean;
  showIndex: boolean;
  onToggleSelect: () => void;
  onClick?: () => void;
}

export interface TableFooterBuilderProps {
  totalItems: number;
  children?: React.ReactNode;
}

export interface TableEmptyBuilderProps {
  message: string;
  colSpan: number;
}

export interface DataTableBaseProps<T> {
  table: TableAPI<T>;
  data: T[];
  /** Offset for row indices — enables continuous numbering across pages (default: 0). */
  startIndex?: number;
  onRowClick?: (item: T) => void;
  headBuilder?: React.FC<TableHeadBuilderProps<T>>;
  rowBuilder?: React.FC<TableRowBuilderProps<T>>;
  footerBuilder?: React.FC<TableFooterBuilderProps>;
  emptyBuilder?: React.FC<TableEmptyBuilderProps>;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
}
