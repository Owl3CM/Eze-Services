import { createFactory } from "../../Factory";
import { FactoryQueryConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { LoaderSlice } from "../Slices/Loader/LoaderSlice";
import { LoaderFunction, LoaderProps } from "../Slices/Loader/Types";
import { TableSlice } from "../Slices/Table/TableSlice";
import { TableSliceConfig } from "../Slices/Table/Types";
import { ExporterSlice } from "../Slices/Exporter/ExporterSlice";
import { ExporterSliceConfig } from "../Slices/Exporter/Types";
import { DefaultStatusKit } from "../Constants/StatusDefaults";

export function createStaticTableFactory<L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined, M extends QueryComponentMap = {}>(config: {
  query?: FactoryQueryConfig<M>;
  loader: LoaderProps<L, R, Fmt>;
  status?: Partial<StatusSliceConfig>;
  table: TableSliceConfig<Fmt extends undefined ? (R extends any[] ? R[number] : never) : Fmt extends any[] ? Fmt[number] : never>;
  exporter?: ExporterSliceConfig<Fmt extends undefined ? (R extends any[] ? R[number] : never) : Fmt extends any[] ? Fmt[number] : never>;
}) {
  type Item = Fmt extends undefined ? (R extends any[] ? R[number] : never) : Fmt extends any[] ? Fmt[number] : never;

  const statusConfig = config.status ? { ...config.status, statusKit: { ...DefaultStatusKit, ...config.status.statusKit } } : { statusKit: DefaultStatusKit };

  return createFactory()
    .use(StatusSlice(statusConfig as any))
    .use(QuerySlice(config.query ?? ({ filters: {}, componentMap: {} } as any)))
    .use(LoaderSlice<L, R, Fmt>(config.loader))
    .use(TableSlice<Item>(config.table))
    .use(ExporterSlice<Item>({ ...(config.exporter ?? ({} as any)) }));
}
