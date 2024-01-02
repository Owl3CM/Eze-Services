import { useLocation, useNavigate, useParams } from "react-router-dom";

interface IQueryBuilderProps {
  onQueryChange?: (query: any) => void;
  defaultQuery?: any;
  service?: {
    setQueryParams: (query: any) => void;
    queryParams?: any;
  };
}
export class QueryBuilder<T = any> {
  constructor({ service, onQueryChange = service?.setQueryParams, defaultQuery = service?.queryParams }: IQueryBuilderProps) {
    this.onQueryChange = onQueryChange ?? (() => {});
    if (defaultQuery)
      Object.entries(defaultQuery).forEach(([key, value]: any) => {
        this.set({ id: key, value } as any);
      });

    this.pathParams = useParams();
    this.navigate = useNavigate();
    this.loaction = useLocation();
    this.init();
  }
  loaction: any;

  init = () => {
    this.storageKey = `url-query-${window.location.pathname}`;
    const search = window.location.search || `?${sessionStorage.getItem(this.storageKey) ?? ""}`;
    new URLSearchParams(search).forEach((value, id) => this.set({ id, value } as any));
    this.query = this.toString();
    this.lastQuery = this.query;
    this.onQueryChange(this.getAll());
  };
  private set = (queryParma: IQueryParam<keyof T>) => {
    if (hasValue(queryParma.value))
      Object.assign(this.queryParams, {
        [queryParma.id]: { value: queryParma.value, title: queryParma.title || "_" },
      });
    else delete this.queryParams[queryParma.id];
  };
  get = (id: keyof T) => {
    const value = (this.queryParams[id] as any)?.value ?? this.pathParams?.[id];
    return hasValue(value) ? value : null;
  };
  toString = () => {
    let str = "";
    Object.entries(this.queryParams).forEach(([key, value]: any) => {
      str += `${key}=${value.value}&`;
    });
    return str;
  };
  getAll = () => {
    const obj: any = {};
    this.getQueryParams(obj);
    this.getPathParsms(obj);
    this.getStateParams(obj);
    return obj;
  };

  getQueryParams = (obj: any = {}) => {
    Object.entries(this.queryParams).forEach(([key, value]: any) => {
      obj[key] = value?.value;
    });
    return obj;
  };

  clearQueryParams = () => {
    this.setQueryParams({} as any);
  };

  getPathParsms = (obj: any = {}) => {
    if (this.pathParams) {
      Object.entries(this.pathParams).forEach(([key, value]) => {
        obj[key] = value;
      });
    }
    return obj;
  };

  getStateParams = (obj: any = {}) => {
    if (this.loaction?.state) {
      Object.entries(this.loaction.state).forEach(([key, value]) => {
        obj[key] = value;
      });
    }
    return obj;
  };

  setQueryParams = (
    queries:
      | IQueryParam<keyof T>[]
      | { [key in keyof T]: IQueryParam<key> }
      | ((queries: { [key in keyof T]: IQueryParam<key> }) => { [key in keyof T]: IQueryParam<key> } | IQueryParam<keyof T>[]) = {} as any
  ) => {
    if (typeof queries === "function") queries = queries(this.queryParams);
    if (Array.isArray(queries)) {
      this.queryParams = {} as any;
      queries.forEach((query) => this.set(query));
    } else this.queryParams = queries;
    this._paramsChanged();
  };

  updateQueryParams = (queryParma: IQueryParam<keyof T> | IQueryParam<keyof T>[]) => {
    if (Array.isArray(queryParma)) queryParma.forEach((query) => this.set(query));
    else this.set(queryParma);
    this._paramsChanged();
  };
  onQueryChange: (queryParams: any) => void;

  private _paramsChanged = () => {
    if (!this._isQueryChanged()) return;
    sessionStorage.setItem(this.storageKey, this.query);
    // this.onQueryChange(this.getAll());
    this.navigate(`?${this.query}`, { replace: true, preventScrollReset: true });
  };

  private _isQueryChanged = () => {
    this.query = this.toString();
    const changed = this.query !== this.lastQuery;
    this.lastQuery = this.query;
    return changed;
  };
  private lastQuery = "";

  navigate: any;
  pathParams: any;
  queryParams: { [key in keyof T]: IQueryParam<key> } = {} as any;
  storageKey = "";
  query = "";

  static Create = <T = any>(props: IQueryBuilderProps) => new QueryBuilder<T>(props);
}
export type IQueryBuilder<T = any> = QueryBuilder<T>;
export interface IQueryParam<K> {
  id: K;
  value: any;
  title?: string;
}

export const hasValue = (value: any) => ![undefined, "undefined", "null", "", "none"].includes(value);
