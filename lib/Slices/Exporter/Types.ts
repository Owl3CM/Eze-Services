import { PaginatorAPI } from "../Paginator/Types";
import { TableAPI, TableColumnDef } from "../Table/Types";
import { LoaderAPI } from "../Loader/Types";
import { OperationHandlerFactory } from "../OperationHandler";

export type ExporterSliceConfig<TItem> = {
  // If provided, use these columns (only columns with export prop are used).
  columns?: TableColumnDef<TItem>[];

  /**
   * prepare receives the resolved items and resolved columns.
   * It may:
   * - return a new items array,
   * - return { items?, cols? } to modify either,
   * - or return void/undefined to not change anything.
   */
  prepare?: (
    items: TItem[],
    cols: TableColumnDef<TItem>[],
  ) => Promise<TItem[] | { items?: TItem[]; cols?: TableColumnDef<TItem>[] } | void> | TItem[] | { items?: TItem[]; cols?: TableColumnDef<TItem>[] } | void;

  // filename factory (no extension)
  filename?: (type: "csv" | "excel") => string;

  // custom data provider (if omitted, use ctx.paginatorHive.honey or ctx.loaderHive.honey)
  dataProvider?: (ctx: any) => TItem[] | Promise<TItem[]>;

  // Optional: Operation handler (default: defaultReadyHandler() — auto-binds to ctx.status.ready())
  operationHandler?: OperationHandlerFactory;

  // Optional: Configurable operation messages (defaults: "Exporting...", "Export failed")
  operationMessages?: {
    loading?: string;
    error?: string;
  };
};

export interface ExporterAPI {
  download: (opts: { type: "csv" | "excel" }) => Promise<void>;
}

// Dependencies can have either paginator or loader
export interface ExporterDependencies<TItem> {
  paginator?: PaginatorAPI<TItem>;
  loader?: LoaderAPI<TItem[]>;
  table: TableAPI<TItem>;
}
