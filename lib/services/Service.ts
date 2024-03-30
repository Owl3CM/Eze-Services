import { ServiceConstructor } from "./Types";
import { defaultLoad, defaultLoadMore, defaultOnError, defaultOnResponse, defaultReload } from "./ServiceDefaultsFunctions";
import { ServiceStatus } from "../Types";
import { IHive, IHiveArray, createHive, createHiveArray } from "../Beehive";
export type IService = Service<IService, any, any, ServiceStatus>;

export class Service<Service, QueryParams = Object, Response = any, Status = ServiceStatus> {
  constructor(props: ServiceConstructor<Service, QueryParams, Response>) {
    const { loader, onError, onResponse, afterLoad, afterReload, afterLoadMore, beforeLoad, beforeReload = beforeLoad, beforeLoadMore } = props as any;

    Object.assign(this, {
      onError: onError ?? defaultOnError(this as any),
    });

    if (loader) {
      this.loader = loader;

      Object.assign(this, {
        onResponse: onResponse ?? defaultOnResponse<Response>(this as any),
      });
      if (loader.load)
        Object.assign(this, {
          load: defaultLoad(this as any),
          afterLoad,
          beforeLoad,
        });

      if (loader.reload)
        Object.assign(this, {
          reload: defaultReload(this as any),
          afterReload,
          beforeReload,
        });

      if (loader.loadMore)
        Object.assign(this, {
          loadMore: defaultLoadMore(this as any),
          afterLoadMore,
          beforeLoadMore,
        });

      this.queryParamsHive.subscribe(() => {
        this.load();
      });

      this.statusHive.subscribe((state: any) => {
        if (typeof state !== "string") state = state.state;
        const loadingState = ["loading", "reloading", "loadingMore"];
        this.canLoadHive.setHoney(loadingState.includes(state));
      });
    }
  }

  dataHive: IHiveArray<Response> = createHiveArray([] as any[]);
  canLoadHive: IHive<boolean> = createHive(false);
  queryParamsHive: IHive<QueryParams> = createHive({} as any);

  statusHive: IHive<Status> = createHive<Status>("idle" as Status);
  statusKit?: any;

  setQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    this.queryParamsHive.setHoney(prev);
  };
  updateQueryParams = (params: QueryParams) => {
    this.queryParamsHive.setHoney({ ...this.queryParamsHive.honey, ...params });
  };

  loader: {
    load: (queryParams?: QueryParams) => Promise<Response>;
    reload: (queryParams?: QueryParams) => Promise<Response>;
  } = {} as any;

  load = async () => Promise<Response>;
  reload = async () => Promise<Response>;

  onError = ({ error, service }: { error: any; service: Service }) => {
    this.statusHive.setHoney({ status: "error", props: { error, service } } as any);
  };
  onResponse = async ({ data, service, clear, hasMore }: { data: any[]; service: Service; clear?: boolean; hasMore: boolean }) => {};

  afterLoad = (data: any, service: Service) => {};
  afterReload = (data: any, service: Service) => {};

  beforeLoad = (service: Service, clearCash: boolean) => {};
  beforeReload = (service: Service, clearCash: boolean) => {};
}
