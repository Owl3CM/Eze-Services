const hasValue = (value) => [undefined, null, ""].includes(value) === false;

const generateQuery = (query, url) => {
  query = Object.entries(query).reduce((acc, [id, value]) => {
    if (hasValue(value.value)) acc += `${id}=${value.value}&`;
    return acc;
  }, "");
  return `${url ? `/${url}` : ""}?${query.trimEnd("&")}`;
};

export default class PagenationService {
  items = [];
  setItems = (items, clear) => {
    this.items = clear ? items : [...this.items, ...items];
  };

  state = "idle";
  setState = ({ state = "idle", parentId, props }) => {
    this.state = state;
  };

  offset = 0;
  limit = 25;
  query = "";
  canFetch = false;
  // autoFetch? = false;
  queryParams = {};
  callback;

  onResponse = (result, service) => result;
  onError = (error, service) => {};

  load = async () => {};
  loadMore = async () => {};
  reload = async () => {};

  #_init = false;

  constructor({ onResponse, onError, storageKey, storage, callback, useCash = false, limit = 25, endpoint, queryGenerator = generateQuery }) {
    this.useCash = useCash && !!storageKey;
    if (this.useCash) {
      this.storageKey = storageKey;
      this.storage = storage;
      this.getCleanString = (text = "") => storageKey + text.replace(/[?&=/!]/g, "-");
    }
    // this.autoFetch = autoFetch;
    this.onResponse = onResponse;
    this.onError = onError;
    this.limit = limit;
    this.callback = callback;
    this.queryGenerator = queryGenerator;
    this.load = async () => {
      this.canFetch = false;
      this.offset = 0;
      if (!this.queryParams.limit && this.limit) this.queryParams.limit = { value: this.limit, title: "_" };

      this.query = generateQuery(this.queryParams, endpoint);

      if (this.useCash) {
        let cashItems = this.getStored(this.query);
        if (cashItems) {
          if (!this.#_init) {
            this.#_init = true;
            this.items = cashItems;
          } else this.setItems(cashItems);
          this.offset = cashItems.length;
          this.setState("none");
          setTimeout(() => {
            this.canFetch = true;
          }, 10);
          return;
        }
      }
      this.state = "loading";
      this.setState("loading");
      try {
        let result = await this.callback(this.query);
        this.#onResponse(result, this);
      } catch (error) {
        this.#onError(error, this);
      }
    };

    this.reload = async () => {
      this.canFetch = false;
      this.offset = 0;
      this.query = generateQuery(this.queryParams, endpoint);
      this.setState("reloading");
      try {
        let result = await this.callback(this.query);
        this.clearStorage();
        this.#onResponse(result, this);
      } catch (error) {
        this.#onError(error, this);
      }
    };

    this.loadMore = async () => {
      this.canFetch = false;
      let query = this.query + `&offset=${this.offset}`;
      this.setState("loadingMore");
      try {
        let result = await this.callback(query);
        this.#onResponse(result, this);
      } catch (error) {
        this.#onError(error, this);
      }
    };
  }

  initQueryParams = (values) => {
    this.queryParams = values;
    this.load();
  };
  setQueryParmas = (values) => {
    this.queryParams = values;
    this.load();
  };
  updateQueryParams = (queryParma = { value: "jhon", title: "the name" }) => {
    console.log(this.queryParams.value);
    if (hasValue(queryParma.value)) {
      this.queryParams[queryParma.id] = {
        value: queryParma.value,
        title: queryParma.title || "_",
      };
    } else delete this.queryParams[queryParma.id];
    this.load();
  };

  #onError = (error, service) => {
    console.log(error);
    service.onError?.(error, service);
    if (error.stack) error = { message: error.message, stack: error.stack };
    service.setState({ state: "error", props: { error } });
  };

  #onResponse = async (data, service) => {
    data = (await service.onResponse?.(data, service)) ?? data;

    let items = [];
    let _data = {};
    if (!Array.isArray(data)) {
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) items = value;
        else _data[key] = value;
      });
    } else items = data || [];

    if (service.useCash) {
      if (service.offset === 0) {
        let allCashQueries = service.getStored("") || [];
        if (!allCashQueries.includes(service.query)) {
          allCashQueries.push(service.query);
          service.setStorage("", allCashQueries);
        }
        service.setStorage(service.query, items);
      } else {
        let oldItems = service.getStored(service.query) || [];
        service.setStorage(service.query, [...oldItems, ...items]);
      }
    }

    if (service.offset === 0) service.setItems(items, true);
    else service.setItems((_prev) => [..._prev, ...items]);

    service.offset += items.length;

    setTimeout(() => {
      service.canFetch = !!(service.limit && items.length >= service.limit);
    }, 100);

    // if (service.autoFetch) {
    //     const scroller = document.getElementById(service.scrollerId);
    //     console.log(service.scrollerId, scroller);
    //     setTimeout(() => {
    //         scroller && scroller.scrollTo({ top: scroller.scrollHeight, left: 0, behavior: "auto" });
    //     }, 100);
    // } else
    service.setState(service.items.length > 0 || items.length > 0 ? "none" : "noContent");
  };
  getStored = (store_key) => JSON.parse(this.storage.getItem(this.getCleanString(store_key)));
  removeStorage = (store_key) => this.storage.removeItem(this.getCleanString(store_key));
  setStorage = (store_key, data) =>
    Object.values(data).length > 0 ? this.storage.setItem(this.getCleanString(store_key), JSON.stringify(data)) : this.removeStorage(store_key);
  clearStorage = () => {
    for (let i = 0; i < this.storage?.length; i++) {
      let key = this.storage.key(i);
      if (key.startsWith(this.storageKey)) this.storage.removeItem(key);
    }
    this.setItems([]);
  };
}
