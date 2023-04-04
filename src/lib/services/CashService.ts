import ApiService from "./ApiService";
interface ICashProps {
  baseURL: string;
  headers: any;
  onResponse?: Function;
  storageKey: string;
  storage?: any;
}
export default class CashService {
  // static local = ({ baseURL, headers, onResponse, storageKey }) => new StorageService({ baseURL, headers, onResponse, storageKey, storageType: "local" });
  // static session = ({ baseURL, headers, onResponse, storageKey }) => new StorageService({ baseURL, headers, onResponse, storageKey, storageType: "local" });
  api: ApiService;
  storage?: any;
  storageKey?: string;
  getCleanString: any;
  get: any;
  post: any;
  put: any;
  delete: any;

  constructor({ baseURL, headers, onResponse, storageKey, storage = localStorage }: ICashProps) {
    this.api = new ApiService({ baseURL, headers, onResponse, storageKey, storage });
    this.storage = storage;
    this.storageKey = storageKey;

    this.get = async (endpoint: string, body: any) => {
      const res = this.getStored(endpoint);
      if (!res) {
        const res = await this.api.get(endpoint);
        this.setStorage(endpoint, res);
      }
      return res;
    };
    this.post = async (endpoint: string, body: any) => {
      this.api
        .post(endpoint, body)
        .then((result) => {
          alert("done");
          console.log("done");
          return result;
        })
        .catch((err) => {
          console.log({ err });
          if (err.message === "Network Error") this.setStorage(`post-${endpoint}`, body);
          throw err;
        });
    };
    this.put = async (endpoint: string, body: any) => {
      this.api
        .put(endpoint, body)
        .then((result) => {
          alert("done");
          console.log("done");
          return result;
        })
        .catch((err) => {
          console.log({ err });
          if (err.message === "Network Error") this.setStorage(`put-${endpoint}`, body);
          throw err;
        });
    };
    this.delete = async (endpoint: string, body: any) => {
      this.api
        .delete(endpoint)
        .then((result) => {
          alert("done");
          console.log("done");
          return result;
        })
        .catch((err) => {
          console.log({ err });
          if (err.message === "Network Error") this.setStorage(`delete-${endpoint}`, body);
          throw err;
        });
    };
  }
  #onError = (err: any) => {
    console.log({ ERR: err });
    // Logger(err);
    if (err.message === "Network Error" || err.message === "Failed to fetch") {
      // Toast({ title: "NoInternetConnection", type: "error", timeout: 10000 });
      return err;
    }

    let response = err.response;
    if (response?.status !== 404) {
      if (err.config?.url?.includes("login")) {
        // Toast({ title: "RongPasswordOrPhoneNumber", type: "error" });
      } else {
        // let details = response?.data?.details || ErrorTitles.Error;
        // let errText = ErrorTitles[details] || details;
        // Toast({ title: "Error", content: response?.data?.details, type: "error" });
      }
    } else if (response.status === 401) {
      localStorage.removeItem("token");
    }
    return err;
  };
  getStored = (store_key: string) => JSON.parse(this.storage.getItem(this.getCleanString(store_key)));
  removeStorage = (store_key: string) => this.storage.removeItem(this.getCleanString(store_key));
  setStorage = (store_key: string, data: any) =>
    Object.values(data).length > 0 ? this.storage.setItem(this.getCleanString(store_key), JSON.stringify(data)) : this.removeStorage(store_key);
  clearStorage = () => {
    for (let i = 0; i < this.storage?.length; i++) {
      let key = this.storage.key(i);
      if (key.startsWith(this.storageKey)) this.storage.removeItem(key);
    }
  };
}
