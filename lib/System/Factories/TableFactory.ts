import { FactoryQueryConfig, QueryComponentMap } from "../Slices/Query/Types";
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
import { DefaultStatusKit } from "../Constants/StatusDefaults";
import { createFactory } from "../../Factory";

export function createTableFactory<
  P extends {
    load: (...args: any[]) => Promise<any>;
    reload: (...args: any[]) => Promise<any>;
    loadMore: () => Promise<any>;
    hasMore: boolean;
    limit: number;
  },
  R = Awaited<ReturnType<P["load"]>>,
  Fmt = undefined,
  M extends QueryComponentMap = {},
  K extends IStatusKit = typeof DefaultStatusKit,
  OperationName extends string = string,
>(config: {
  query?: FactoryQueryConfig<M>;
  paginator: PaginatorProps<P, R, Fmt, any>;
  status?: Partial<StatusSliceConfig<K, OperationName>>;
  table: TableSliceConfig<ArrayElement<Fmt extends undefined ? R : Fmt>>;
  exporter?: ExporterSliceConfig<ArrayElement<Fmt extends undefined ? R : Fmt>>;
}) {
  type Item = ArrayElement<Fmt extends undefined ? R : Fmt>;

  const statusConfig = config.status ? { ...config.status, statusKit: { ...DefaultStatusKit, ...config.status.statusKit } } : { statusKit: DefaultStatusKit };

  return createFactory()
    .use(StatusSlice<K, OperationName>(statusConfig as any))
    .use(QuerySlice(config.query ?? ({ filters: {}, componentMap: {} } as any)))
    .use(PaginatorSlice<P, R, Fmt, OperationName>(config.paginator))
    .use(TableSlice<Item>(config.table))
    .use(ExporterSlice<Item>({ ...(config.exporter ?? ({} as any)) }));
}
