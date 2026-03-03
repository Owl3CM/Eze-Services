import { IHive } from "../../Hives";
import { PaginatorAPI } from "../Paginator/Types";
import { LoaderAPI } from "../Loader/Types";

export type TableExportFn<T> = (item: T) => string | number | boolean | Date | null | undefined;

export type TableColumnDef<T> = {
  id: string;
  header?: string;
  headerComponent?: (tableSlice: TableAPI<T>) => React.ReactNode;
  visible?: boolean;
  colSpan?: number;
  cell?: (item: T, meta: { index: number }) => React.ReactNode;
  hideOnPrint?: boolean;
  export?: {
    value: TableExportFn<T>;
    calcTotal?: boolean;
    width?: number;
    getStyle?: (item: T) => any;
  };
};

export type TableSort<T> = {
  id: keyof T | string;
  dir: "asc" | "desc";
  index?: number;
};

export type TableSliceConfig<TItem, Ctx = any> = {
  columns: (ctx: Ctx) => TableColumnDef<TItem>[];
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
  setVisibleColumns: (cols: TableColumnDef<TItem>[]) => void;
  getVisibleColumns: () => TableColumnDef<TItem>[];
  toggleColumnVisibility: (colId: string) => void;
  toggleAllColumns: (val?: boolean) => void;
  resetColumns: () => void;
  restoreColumns: () => void;
  clearStoredColumns: () => void;
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
  onRowClick?: (item: T) => void;
  headBuilder?: React.FC<TableHeadBuilderProps<T>>;
  rowBuilder?: React.FC<TableRowBuilderProps<T>>;
  footerBuilder?: React.FC<TableFooterBuilderProps>;
  emptyBuilder?: React.FC<TableEmptyBuilderProps>;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
}
