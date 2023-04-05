export type ServiceState = "idle" | "loading" | "reloading" | "error" | "noContent" | "loadingMore" | { state: ServiceState; props: any };

export interface QueryParam {
  id: string;
  value: any;
  title?: string;
}
export interface QueryParams {
  [id: string]: QueryParam;
}

export interface IService {
  data: any;
  setData: (data: any[] | Function) => void;

  state: ServiceState;
  setState: (state: ServiceState) => void;

  offset: number;
  limit: number;
  query: string;
  canFetch: boolean;
  queryParams: QueryParams;
  useCash: boolean;

  onError?: (error: any, service: IService) => void;
  onResponse?: (response: any, service: IService) => void;
  interceptor?: (service: IService) => void;

  load: () => Promise<void>;
  reload: () => Promise<void>;
  setQueryParmas: (queries: QueryParam[]) => void;
  updateQueryParams: (query: QueryParam) => void;
  //callback: (url: string) => Promise<any>;
  //loadMore: () => Promise<void>;

  storage?: any;
  storageKey?: string;
  getStored?: (key: string) => any;
  store?: (key: string, value: any) => void;
}

export interface IPagenationService extends IService {
  callback: (url: string) => Promise<any>;
  loadMore: () => Promise<void>;
}

export interface ServiceConstructor {
  onError?: (error: any, service: IService) => void;
  callback: (url: string) => Promise<any>;
  onResponse?: (response: any, service: IService) => void;
  interceptor?: (service: IService) => void;
  storage?: any;
  storageKey?: string;
  useCash?: boolean;
}
