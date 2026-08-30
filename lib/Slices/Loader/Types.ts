import { IHive } from "../../Hives";
import { OperationHandlerFactory } from "../OperationHandler";
import { QueryAPI } from "../Query/Types";

export type LoaderFunction<Params = any, Response = any> = (params?: Params, clearCache?: boolean) => Promise<Response>;

export interface LoaderProps<L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined, Q = any> {
  loader: L;
  format?: (raw: R) => Fmt;
  onError?: (e: unknown) => void;
  shouldLoadOnQueryChange?: (query: Q, controls: { clear: () => void }) => boolean;

  /** Named operation — auto-links to StatusSlice if present */
  operation?: string;

  /** Override the default handler */
  operationHandler?: OperationHandlerFactory;
}

export interface LoaderAPI<Response> {
  loaderHive: IHive<Response>;
  load: (params?: any, clearCache?: boolean) => Promise<void>;
  reload: (params?: any) => Promise<void>;
  isLoading: () => boolean;

  /** Declared operation name (undefined if no operation configured) */
  operation: string | undefined;
}

export interface LoaderDependencies {
  status?: any;
  query?: QueryAPI<any, any>;
}
