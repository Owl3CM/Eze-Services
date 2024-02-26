import { PagenatedServiceConstructor } from "./Types";
import { defaultLoad, defaultLoadMore, defaultOnError, defaultOnResponse, defaultReload } from "./ServiceDefaults";
import { State as IState, ServiceState } from "../Types";
import { StateBuilder } from "../stateKit";

export type IPagenatedService = PagenatedService<IPagenatedService, any, ServiceState>;

export class PagenatedService<Service, QueryParams = Object, State = IState> extends StateBuilder<State> {
  constructor({
    client,
    onError,
    onResponse,
    afterLoad,
    afterReload,
    afterLoadMore,
    beforeLoad,
    beforeReload = beforeLoad,
    beforeLoadMore,
  }: PagenatedServiceConstructor<Service, QueryParams>) {
    super();
    Object.assign(this, {
      client,
      onResponse: onResponse ?? defaultOnResponse(this as any),
      onError: onError ?? defaultOnError(this as any),
      load: defaultLoad(this as any),
      reload: defaultReload(this as any),
      loadMore: defaultLoadMore(this as any),
      afterLoad,
      afterReload,
      afterLoadMore,
      beforeLoad,
      beforeReload,
      beforeLoadMore,
    });

    if (!afterLoad)
      this.afterLoad = (data) => {
        this.onResponse({ data, service: this as any, clear: true });
        setTimeout(() => {
          this.canLoadMore = !!(this.limit && data.length >= this.limit);
        }, 100);
      };
    if (!afterReload) this.afterReload = this.afterLoad;
    if (!afterLoadMore) {
      this.afterLoadMore = (data) => {
        this.onResponse({ data, service: this as any, clear: false });
        setTimeout(() => {
          this.canLoadMore = !!(this.limit && data.length >= this.limit);
        }, 100);
      };
    }
  }

  queryParams: QueryParams = {} as any;
  setQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    if (typeof prev === "function") prev = (prev as any)(this.queryParams);
    (this.queryParams as any) = prev;
    this.load();
  };
  updateQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    if (typeof prev === "function") prev = (prev as any)(this.queryParams);
    (this.queryParams as any) = { ...this.queryParams, ...prev };
    this.load();
  };
  offset = 0;
  limit = 25;
  canLoadMore = false;

  client: {
    load: (queryParams?: QueryParams) => Promise<any> | any;
    reload: (queryParams?: QueryParams) => Promise<any> | any;
    loadMore: (queryParams?: QueryParams) => Promise<any> | any;
  } = {
    load: () => {},
    reload: () => {},
    loadMore: () => {},
  };

  data: any = [];
  setData = (prev: any | ((prev: any) => any)) => {
    if (typeof prev === "function") prev = prev(this.data);
    this.data = prev;
  };

  state = "idle" as any;
  setState = (prev: any | ((prev: any) => any)) => {
    if (typeof prev === "function") prev = prev(this.state);
    this.state = prev;
  };

  onResponse = async ({ data, service, clear }: { data: any[]; service: Service; clear?: boolean }) => {};

  load = async () => Promise<any>;
  reload = async () => Promise<any>;
  loadMore?: () => Promise<any>;

  interceptor?: ((service: Service) => void) | undefined;
  onError = ({ error, service }: { error: any; service: Service }) => {
    this.setState({ state: "error", props: { error, service } });
  };

  afterLoad = (data: any, service: Service) => {};
  afterReload = (data: any, service: Service) => {};
  afterLoadMore = (data: any, service: Service) => {};

  beforeLoad = (service: Service, clearCash: boolean) => {};
  beforeReload = (service: Service, clearCash: boolean) => {};
  beforeLoadMore = (service: Service) => {};
}
