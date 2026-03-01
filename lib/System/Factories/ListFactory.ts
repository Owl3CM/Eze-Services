import { FactoryQueryConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { IStatusKit, StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { PaginatorSlice } from "../Slices/Paginator/PaginatorSlice";
import { PaginatorProps } from "../Slices/Paginator/Types";
import { DefaultStatusKit } from "../Constants/StatusDefaults";
import { createFactory } from "../../Factory";

type DefaultStatusMap = typeof DefaultStatusKit;

export function createListFactory<
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
  SK extends Record<string, any> = {},
  K extends IStatusKit = DefaultStatusMap & SK,
  OperationName extends string = string,
>(config: {
  query?: FactoryQueryConfig<M>;
  paginator: PaginatorProps<P, R, Fmt, any>;
  status?: Partial<StatusSliceConfig<K, OperationName>> & { statusKit?: SK };
}) {
  const statusConfig = config.status ? { ...config.status, statusKit: { ...DefaultStatusKit, ...config.status.statusKit } } : { statusKit: DefaultStatusKit };

  return createFactory()
    .use(StatusSlice<K, OperationName>(statusConfig as any))
    .use(QuerySlice(config.query ?? ({ filters: {}, componentMap: {} } as any)))
    .use(PaginatorSlice<P, R, Fmt, OperationName>(config.paginator));
}
