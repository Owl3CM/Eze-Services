import { IService, QueryParam, QueryParams, ServiceConstructor, ServiceState } from "./Types";

export default class Service implements IService {
  data = [];
  setData = (items: any, clear?: boolean) => {
    this.data = clear ? items : { ...this.data, ...items };
  };

  state: ServiceState = "idle";
  setState = (state: ServiceState) => {
    this.state = state;
  };

  offset = 0;
  limit = 25;
  query = "";
  canFetch = false;
  queryParams = {
    limit: { id: "limit", value: this.limit, title: "limit" },
  };

  callback = async (url: string) => {};

  load = async () => {};
  reload = async () => {};
  interceptor?: ((service: IService) => void) | undefined;

  #_init = false;
  useCash = false;
  getStored? = (store_key: string) => {};
  removeStorage = (store_key: string) => {};
  store? = (store_key: string, data: any) => {};
  clearStorage = () => {};
  getCleanString: any = () => {};
  storage: any = {};
  storageKey = "";
  onError: (error: any) => void;
  onResponse: (response: any) => void;

  constructor({ callback, onError: outerOnError, onResponse: outerOnResponse, interceptor, storage = localStorage, useCash, storageKey }: ServiceConstructor) {
    Object.assign(this, { callback, interceptor, storage, useCash, storageKey });

    this.load = async () => {
      this.canFetch = false;
      this.offset = 0;
      this.query = generateQuery(this.queryParams);
      // if (this.useCash) {
      //     let cashItems = this.getStored(this.query);
      //     if (cashItems) {
      //         if (!this.#_init) {
      //             this.#_init = true;
      //             this.appointments = cashItems;
      //         } else this.setAppointments(cashItems);
      //         this.offset = cashItems.length;
      //         this.setState("none");
      //         setTimeout(() => {
      //             this.canFetch = true;
      //         }, 10);
      //         return;
      //     }
      // }
      this.state = "loading";
      this.setState("loading");
      try {
        const result = await this.callback(this.query);
        this.onResponse(result);
      } catch (error) {
        this.onError(error);
      }
    };

    this.reload = async () => {
      this.canFetch = false;
      this.offset = 0;
      this.query = generateQuery(this.queryParams);
      this.interceptor?.(this);
      this.setState("reloading");
      try {
        const result = await this.callback(this.query);
        this.clearStorage();
        this.onResponse(result);
      } catch (error) {
        this.onError(error);
      }
    };

    this.useCash = !!(useCash && !!storageKey && !!storage);
    if (this.useCash) {
      if (this.storage && this.storageKey) {
        this.getStored = (store_key: string) => JSON.parse(this.storage.getItem(this.getCleanString(store_key)) || "");
        this.removeStorage = (store_key: string) => this.storage.removeItem(this.getCleanString(store_key));
        this.store = (store_key: string, data: any) =>
          Object.values(data).length > 0 ? this.storage.setItem(this.getCleanString(store_key), JSON.stringify(data)) : this.removeStorage(store_key);
        this.clearStorage = () => {
          for (let i = 0; i < this.storage?.length; i++) {
            let key = this.storage.key(i);
            if (key.startsWith(this.storageKey)) this.storage.removeItem(key);
          }
          this.setData({});
        };
        this.getCleanString = (text = "") => this.storageKey + text.replace(/[?&=/!]/g, "-");
      }
    }

    this.onError = (error: any) => {
      console.log(error);
      outerOnError?.(error, this);
      if (error.stack) error = { message: error.message, stack: error.stack };
      this.setState({ state: "error", props: { error } });
    };

    this.onResponse = async (data: any) => {
      const clear = this.offset === 0;
      this.offset += data.length;
      this.setData((prev: any[]) => (clear ? data : [...prev, ...data]));

      setTimeout(() => {
        this.canFetch = !!(this.limit && data.length >= this.limit);
      }, 100);
      this.setState(Object.keys(this.data).length > 0 || data.length > 0 ? "none" : "noContent");
    };
  }

  setQueryParmas = (queries: QueryParam[]) => {
    queries.forEach((query) => {
      Object.assign(this.queryParams, {
        [query.id]: hasValue(query.value) ? { value: query.value, title: query.title || "_" } : undefined,
      });
    });
    this.load();
  };
  updateQueryParams = (queryParma: QueryParam) => {
    Object.assign(this.queryParams, {
      [queryParma.id]: hasValue(queryParma.value) ? { value: queryParma.value, title: queryParma.title || "_" } : undefined,
    });
    this.load();
  };
}

const hasValue = (value: any) => [undefined, null, ""].includes(value) === false;
const generateQuery = (query: QueryParams, url?: string) => {
  const _query = Object.entries(query).reduce((acc, [id, value]) => {
    if (hasValue(value?.value)) acc += `${id}=${value.value}&`;
    return acc;
  }, "");
  return `${url ? `/${url}` : ""}?${_query.slice(0, -1)}`;
};
