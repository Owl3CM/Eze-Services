import { QuerySliceConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { IStatusKit, StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { PaginatorSlice } from "../Slices/Paginator/PaginatorSlice";
import { PaginatorProps } from "../Slices/Paginator/Types";
import { createFactory } from "../Factory";

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
  K extends IStatusKit = IStatusKit,
  OperationName extends string = string,
>(config: { status: StatusSliceConfig<K, OperationName>; query?: QuerySliceConfig<M, any>; paginator: PaginatorProps<P, R, Fmt, any> }) {
  return createFactory()
    .use(StatusSlice<K, OperationName>(config.status))
    .use(QuerySlice(config.query ?? ({ filters: {} as Record<string, never>, componentMap: {} as M } as QuerySliceConfig<M, Record<string, never>>)))
    .use(PaginatorSlice<P, R, Fmt>({ ...config.paginator, operation: config.paginator.operation ?? "paginator" }));
}
