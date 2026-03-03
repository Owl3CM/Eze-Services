import { IHive, IHiveList } from "../../Hives";
import { OperationHandlerFactory } from "../OperationHandler";
import { QueryAPI } from "../Query/Types";

export interface PaginatorProps<
  P extends {
    load: (...args: any[]) => Promise<any>;
    reload: (...args: any[]) => Promise<any>;
    loadMore: () => Promise<any>;
    hasMore: boolean;
    limit: number;
  },
  R = Awaited<ReturnType<P["load"]>>,
  F = undefined,
  Q = any,
> {
  paginator: P;
  format?: (raw: R) => F;
  onError?: (e: unknown) => void;
  shouldLoadOnQueryChange?: (query: Q, controls: { clear: () => void }) => boolean;

  /** Named operation — auto-links to StatusSlice if present */
  operation?: string;

  /** Override the default handler */
  operationHandler?: OperationHandlerFactory;
}

export interface PaginatorAPI<Item, Query = any> {
  paginatorHive: IHiveList<Item>;
  load: (q?: Query) => Promise<void>;
  reload: (q?: Query) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  limit: number;
  canLoadHive: IHive<boolean>;

  /** Declared operation name (undefined if no operation configured) */
  operation: string | undefined;

  /** Unsubscribe from query listener (if QuerySlice was present). */
  dispose?: () => void;
}

export interface PaginatorDependencies {
  status?: any;
  query?: QueryAPI<any>;
}
