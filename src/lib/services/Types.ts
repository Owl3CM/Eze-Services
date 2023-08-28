// type State = "idle" | "loading" | "reload" | "processing" | "reloading" | "searching" | "error" | "noContent" | "loadingMore" | string;
// export type ServiceState = State | { state: State; props: any; parent?: HTMLElement | undefined };

export interface ICleintQueryParams {
  [id: string]: string | number | boolean;
}

export interface ClientServiceConstructor<Service, QueryParams> {
  onError?: (error: any, service: Service) => void;
  client: {
    load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<any> | any;
    reload: (queryParams?: QueryParams, clearCash?: boolean) => Promise<any> | any;
    loadMore?: (queryParams?: QueryParams, clearCash?: boolean) => Promise<any> | any;
  };
  interceptor?: (service: Service) => void;

  storage?: any;
  storageKey?: string;
  useCash?: boolean;

  afterLoad?: (data: any, service: Service) => Promise<any>;
  afterReload?: (data: any, service: Service) => Promise<any>;
  afterLoadMore?: (data: any, service: Service) => Promise<any>;

  beforeLoad?: (service: Service, clearCash: boolean) => void;
  beforeReload?: (service: Service, clearCash: boolean) => void;
  beforeLoadMore?: (service: Service) => void;

  onResponse?: (response: any, service: Service, clear: boolean) => any;
}
