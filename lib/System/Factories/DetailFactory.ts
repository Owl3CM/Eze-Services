import { createFactory } from "../../Factory";
import { FactoryQueryConfig, QueryComponentMap } from "../Slices/Query/Types";
import { StatusSlice } from "../Slices/Status/StatusSlice";
import { IStatusKit, StatusSliceConfig } from "../Slices/Status/Types";
import { QuerySlice } from "../Slices/Query/QuerySlice";
import { LoaderSlice } from "../Slices/Loader/LoaderSlice";
import { LoaderFunction, LoaderProps } from "../Slices/Loader/Types";
import { DefaultStatusKit } from "../Constants/StatusDefaults";

type DefaultStatusMap = typeof DefaultStatusKit;

export function createDetailFactory<
  L extends LoaderFunction,
  R = Awaited<ReturnType<L>>,
  Fmt = undefined,
  M extends QueryComponentMap = {},
  K extends IStatusKit = DefaultStatusMap,
  OperationName extends string = string,
>(config: { query?: FactoryQueryConfig<M>; loader: LoaderProps<L, R, Fmt>; status?: Partial<StatusSliceConfig<K, OperationName>> }) {
  const statusConfig = config.status ? { ...config.status, statusKit: { ...DefaultStatusKit, ...config.status.statusKit } } : { statusKit: DefaultStatusKit };

  return createFactory()
    .use(StatusSlice<K, OperationName>(statusConfig as any))
    .use(QuerySlice(config.query ?? ({ filters: {}, componentMap: {} } as any)))
    .use(LoaderSlice<L, R, Fmt, OperationName>(config.loader));
}
