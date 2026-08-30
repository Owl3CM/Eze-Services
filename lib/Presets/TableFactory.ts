import { QuerySliceConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { IStatusKit, StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { PaginatorSlice } from "../Slices/Paginator/PaginatorSlice";
import { PaginatorProps } from "../Slices/Paginator/Types";
import { TableSlice } from "../Slices/Table/TableSlice";
import { TableSliceConfig } from "../Slices/Table/Types";
import { ExporterSlice } from "../Slices/Exporter/ExporterSlice";
import { ExporterSliceConfig } from "../Slices/Exporter/Types";
import { ArrayElement } from "../Slices/Paginator/PaginatorMechanics";
import { createFactory } from "../Factory";

export function createTableFactory<
  P extends {
    load: (...args: any[]) => Promise<any>;
    reload: (...args: any[]) => Promise<any>;
    loadMore: () => Promise<any>;
    goToPage: (page: number) => Promise<any>;
    hasMore: boolean;
    limit: number;
  },
  R = Awaited<ReturnType<P["load"]>>,
  Fmt = undefined,
  M extends QueryComponentMap = {},
  K extends IStatusKit = IStatusKit,
  OperationName extends string = string,
>(config: {
  status: StatusSliceConfig<K, OperationName>;
  query?: QuerySliceConfig<M, any>;
  paginator: PaginatorProps<P, R, Fmt, any>;
  table: TableSliceConfig<ArrayElement<Fmt extends undefined ? R : Fmt>>;
  exporter?: ExporterSliceConfig<ArrayElement<Fmt extends undefined ? R : Fmt>>;
}) {
  type Item = ArrayElement<Fmt extends undefined ? R : Fmt>;

  return createFactory()
    .use(StatusSlice<K, OperationName>(config.status))
    .use(QuerySlice(config.query ?? ({ filters: {} as Record<string, never>, componentMap: {} as M } as QuerySliceConfig<M, Record<string, never>>)))
    .use(PaginatorSlice<P, R, Fmt>({ ...config.paginator, operation: config.paginator.operation ?? "paginator" }))
    .use(TableSlice<Item>(config.table))
    .use(ExporterSlice<Item>({ ...(config.exporter ?? ({} as ExporterSliceConfig<Item>)) }));
}
