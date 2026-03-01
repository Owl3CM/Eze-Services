import { IHive } from "../../../Hives";
import { StatusAPI } from "../Status/Types";
import { QueryAPI } from "../Query/Types";

// Loader function signature - takes optional params and clearCache flag
export type LoaderFunction<Params = any, Response = any> = (params?: Params, clearCache?: boolean) => Promise<Response>;

// Props for configuring the LoaderSlice
export interface LoaderProps<L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined, Q = any> {
  loader: L;
  format?: (raw: R) => Fmt;
  onError?: (e: unknown) => void;
  shouldLoadOnQueryChange?: (query: Q, controls: { clear: () => void }) => boolean;
  statusProps?: {
    useStatus?: boolean;
  };
}

// API exposed by LoaderSlice
export interface LoaderAPI<Response> {
  loaderHive: IHive<Response>;
  load: (params?: any, clearCache?: boolean) => Promise<void>;
  reload: (params?: any) => Promise<void>;
  isLoading: () => boolean;
}

export interface LoaderDependencies<OperationName extends string = string> {
  status: StatusAPI<any, OperationName>;
  query?: QueryAPI<any, any>;
}
