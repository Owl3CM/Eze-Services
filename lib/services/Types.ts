// type Status = "idle" | "loading" | "reload" | "processing" | "reloading" | "searching" | "error" | "noContent" | "loadingMore" | string;
// export type ServiceState = Status | { state: Status; props: any; parent?: HTMLElement | undefined };

export interface IPagenatedServiceParams {
  [id: string]: string | number | boolean;
}

export type PagenatedServiceConstructor<QueryParams, Response, FormattedResponse = Response> = {
  onError?: (error: any) => void;

  paginator: {
    load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response[]>;
    loadMore: () => Promise<Response[]>;
    reload: (queryParams?: QueryParams) => Promise<Response[]>;
    limit: number;
    hasMore: boolean;
  };

  beforeLoad?: (clearCash: boolean) => void;
  beforeReload?: (clearCash: boolean) => void;
  beforeLoadMore?: (clearCash: boolean) => void;

  onResponse?: (response: Response, clear: boolean) => void;
  formatResponse?: (response: Response[]) => FormattedResponse[];
};

export type ServiceConstructor<QueryParams, Response, FormattedResponse = Response> = {
  onError?: (error: any) => void;
} & (
  | {
      loader?: undefined;
    }
  | {
      loader: {
        load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
        limit?: number;
        hasMore?: boolean;
      };
      beforeLoad?: (clearCash: boolean) => void;
      onResponse?: (response: Response, clear: boolean) => Response;
      formatResponse?: (response: Response) => FormattedResponse;
      initialValue: FormattedResponse;
    }
  | {
      loader: {
        load: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
        reload: (queryParams?: QueryParams, clearCash?: boolean) => Promise<Response>;
        limit?: number;
        hasMore?: boolean;
      };
      beforeLoad?: (clearCash: boolean) => void;
      beforeReload?: (clearCash: boolean) => void;
      onResponse?: (response: Response, clear: boolean) => Response;
      formatResponse?: (response: Response) => FormattedResponse;
      initialValue: FormattedResponse;
    }
);
