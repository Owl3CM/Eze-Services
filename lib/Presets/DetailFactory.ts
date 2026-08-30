import { createFactory } from "../Factory";
import { QuerySliceConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { IStatusKit, StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { LoaderSlice } from "../Slices/Loader/LoaderSlice";
import { LoaderFunction, LoaderProps } from "../Slices/Loader/Types";

export function createDetailFactory<
  L extends LoaderFunction,
  R = Awaited<ReturnType<L>>,
  Fmt = undefined,
  M extends QueryComponentMap = {},
  K extends IStatusKit = IStatusKit,
  OperationName extends string = string,
>(config: { status: StatusSliceConfig<K, OperationName>; query?: QuerySliceConfig<M, any>; loader: LoaderProps<L, R, Fmt> }) {
  return createFactory()
    .use(StatusSlice<K, OperationName>(config.status))
    .use(QuerySlice(config.query ?? ({ filters: {} as Record<string, never>, componentMap: {} as M } as QuerySliceConfig<M, Record<string, never>>)))
    .use(LoaderSlice<L, R, Fmt>({ ...config.loader, operation: config.loader.operation ?? "loader" }));
}
