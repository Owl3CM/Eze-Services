// type Status = "idle" | "loading" | "reload" | "processing" | "reloading" | "searching" | "error" | "noContent" | "loadingMore" | string;
// export type ServiceState = Status | { state: Status; props: any; parent?: HTMLElement | undefined };

export interface IPagenatedServiceParams {
  [id: string]: string | number | boolean;
}

export type PagenatedServiceConstructor<Service, QueryParams, Response> = {
  onError?: (error: any, service: Service) => void;

  paginator: {
    load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response[]>;
    reload: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response[]>;
    loadMore?: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response[]>;
    limit: number;
    hasMore: boolean;
  };
  // afterLoad?: (data: any, service: Service) => Promise<Response>;
  // afterReload?: (data: any, service: Service) => Promise<Response>;
  // afterLoadMore?: (data: any, service: Service) => Promise<Response>;

  beforeLoad?: (service: Service, clearCash: boolean) => void;
  beforeReload?: (service: Service, clearCash: boolean) => void;
  beforeLoadMore?: (service: Service, clearCash: boolean) => void;

  onResponse?: (response: any, service: Service, clear: boolean) => Response[];
};

export type ServiceConstructor<Service, QueryParams, Response> = {
  onError?: (error: any, service: Service) => void;
} & (
  | {
      loader?: undefined;
    }
  | {
      loader: {
        load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
      };
      beforeLoad?: (service: Service, clearCash: boolean) => void;
      onResponse?: (response: any, service: Service, clear: boolean) => Response;
      limit: number;
      hasMore: boolean;
    }
  | {
      loader: {
        load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
        reload: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
        limit: number;
        hasMore: boolean;
      };
      beforeLoad?: (service: Service, clearCash: boolean) => void;
      beforeReload?: (service: Service, clearCash: boolean) => void;
      onResponse?: (response: any, service: Service, clear: boolean) => Response;
    }
);
