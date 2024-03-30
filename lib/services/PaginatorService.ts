import { PagenatedServiceConstructor } from "./Types";
import { defaultLoad, defaultLoadMore, defaultOnError, defaultOnResponse, defaultReload } from "./ServiceDefaultsFunctions";
import { ServiceStatus } from "../Types";
import { IHive, IHiveArray, createHive } from "../Beehive";
export type IPaginatorService = PaginatorService<IPaginatorService, any, any, ServiceStatus>;

export class PaginatorService<Service = IPaginatorService, QueryParams = Object, Response = Object, Status = ServiceStatus> {
  constructor(props: PagenatedServiceConstructor<Service, QueryParams, Response>) {
    const { paginator, onError, onResponse, beforeLoad, beforeReload = beforeLoad, beforeLoadMore } = props as any;

    this.paginator = paginator;

    Object.assign(this, {
      onError: onError ?? defaultOnError(this as any),
      onResponse: onResponse ?? defaultOnResponse<Response>(this as any),
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

  dataHive: IHiveArray<Response> = null as any;
  canLoadHive: IHive<boolean> = createHive(true);
  queryParamsHive: IHive<QueryParams> = createHive({} as any);

  statusHive: IHive<Status> = createHive<Status>("idle" as Status);
  statusKit?: any;

  setQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    this.queryParamsHive.setHoney(prev);
  };
  updateQueryParams = (params: QueryParams) => {
    this.queryParamsHive.setHoney({ ...this.queryParamsHive.honey, ...params });
  };

  paginator: {
    load: (queryParams?: QueryParams) => Promise<Response[]>;
    reload: (queryParams?: QueryParams) => Promise<Response[]>;
    loadMore: (queryParams?: QueryParams) => Promise<Response[]>;
    limit: number;
    hasMore: boolean;
  } = {} as any;

  load = async () => Promise<Response[]>;
  reload = async () => Promise<Response[]>;
  loadMore = async () => Promise<Response[]>;

  onError = ({ error, service }: { error: any; service: Service }) => {
    this.statusHive.setHoney({ status: "error", props: { error, service } } as any);
  };
  onResponse = async ({ data, service, clear, hasMore }: { data: any[]; service: Service; clear?: boolean; hasMore: boolean }) => {};

  beforeLoad = (service: Service, clearCash: boolean) => {};
  beforeReload = (service: Service, clearCash: boolean) => {};
  beforeLoadMore = (service: Service) => {};
  // interceptor?: ((service: Service) => void) | undefined;
}
