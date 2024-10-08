import { PagenatedServiceConstructor } from "./Types";
import { defaultLoad, defaultLoadMore, defaultOnPaginatorRes, defaultReload } from "./DefaultsPaginatorServiceFunctions";
import { ServiceStatus } from "../PackageTypes";
import { IHive, IHiveArray, createHive, createHiveArray } from "../Beehive";
import { defaultOnError } from "./DefaultsServiceFunctions";

export type IPaginatorService<QueryParams = Object, Response = any, FormattedResponse = Response, Status = ServiceStatus> = PaginatorService<
  QueryParams,
  Response,
  FormattedResponse,
  Status
>;

export class PaginatorService<QueryParams = Object, Response = Object, FormattedResponse = Response, Status = ServiceStatus> {
  constructor(props: PagenatedServiceConstructor<QueryParams, Response, FormattedResponse>) {
    const { paginator, onError, onResponse, beforeLoad, beforeReload = beforeLoad, beforeLoadMore, formatResponse } = props as any;

    this.paginator = paginator;

    Object.assign(this, {
      onError: onError ?? defaultOnError(this as any),
      onResponse: onResponse ?? defaultOnPaginatorRes<Response, FormattedResponse>(this as any, formatResponse),
      load: defaultLoad(this as any, this.paginator),
      beforeLoad,
      reload: defaultReload(this as any, this.paginator),
      beforeReload,
      loadMore: defaultLoadMore(this as any),
      beforeLoadMore,
    });

    this.queryParamsHive.subscribe(() => {
      this.load();
    });

    this.statusHive.subscribe((state: any) => {
      if (typeof state !== "string") state = state.state;
      const loadingState = ["loading", "reloading", "loadingMore"];
      if (loadingState.includes(state)) this.canLoadHive.setHoney(false);
    });
  }

  dataHive: IHiveArray<FormattedResponse> = createHiveArray([] as FormattedResponse[]);
  canLoadHive: IHive<boolean> = createHive(true);
  queryParamsHive: IHive<QueryParams> = createHive({} as any);

  statusHive: IHive<Status> = createHive<Status>("idle" as Status);
  statusKit?: any;

  setQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    this.queryParamsHive.setHoney(prev);
  };
  updateQueryParams = (params: QueryParams) => {
    this.queryParamsHive.setHoney((prev) => ({ ...prev, ...params }));
  };

  paginator: {
    load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response[]>;
    loadMore: () => Promise<Response[]>;
    reload: (queryParams?: QueryParams) => Promise<Response[]>;
    limit: number;
    hasMore: boolean;
  } = {} as any;

  load = async () => Promise<Response[]>;
  reload = async () => Promise<Response[]>;
  loadMore = async () => Promise<Response[]>;

  onError = (error: any) => {
    this.statusHive.setHoney({ status: "error", props: { error } } as any);
  };
  onResponse = async ({ data, clear, hasMore }: { data: Response[]; clear?: boolean; hasMore: boolean }) => {};

  beforeLoad = (clearCash: boolean) => {};
  beforeReload = (clearCash: boolean) => {};
  beforeLoadMore = () => {};
}
