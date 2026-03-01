import { IHive, IHiveArray } from "../../../Hives";
import { StatusAPI } from "../Status/Types";
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
  Q = any
> {
  paginator: P;
  format?: (raw: R) => F;
  onError?: (e: unknown) => void;
  shouldLoadOnQueryChange?: (query: Q, controls: { clear: () => void }) => boolean;
}

export interface PaginatorAPI<Item, Query = any> {
  paginatorHive: IHiveArray<Item>;
  load: (q?: Query) => Promise<void>;
  reload: (q?: Query) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  limit: number;
  canLoadHive: IHive<boolean>;
}

export interface PaginatorDependencies<OperationName extends string = string> {
  status: StatusAPI<any, OperationName>;
  query?: QueryAPI<any>;
}
