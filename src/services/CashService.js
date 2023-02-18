import ApiService from './ApiService'

export default class CashService {
  constructor({
    baseURL,
    headers,
    onResponse,
    storageKey,
    storage = localStorage
  }) {
    this.api = new ApiService({ baseURL, headers, onResponse })
    this.storage = storage
    this.storageKey = storageKey

    this.get = async (endpoint) => {
      const res = this.getStored(endpoint)
      if (!res) {
        const res = await this.api.get(endpoint)
        this.setStorage(endpoint, res)
      }
      return res
    }
    this.post = async (endpoint, body) => {
      this.api
        .post(endpoint, body)
        .then((result) => {
          alert('done')
          console.log('done')
          return result
        })
        .catch((err) => {
          console.log({ err })
          if (err.message === 'Network Error')
            this.setStorage(`post-${endpoint}`, body)
          throw err
        })
    }
    this.put = async (endpoint, body) => {
      this.api
        .put(endpoint, body)
        .then((result) => {
          alert('done')
          console.log('done')
          return result
        })
        .catch((err) => {
          console.log({ err })
          if (err.message === 'Network Error')
            this.setStorage(`put-${endpoint}`, body)
          throw err
        })
    }
    this.delete = async (endpoint, body) => {
      this.api
        .delete(endpoint)
        .then((result) => {
          alert('done')
          console.log('done')
          return result
        })
        .catch((err) => {
          console.log({ err })
          if (err.message === 'Network Error')
            this.setStorage(`delete-${endpoint}`, body)
          throw err
        })
    }
  }
  #onError = (err) => {
    console.log({ ERR: err })
    // Logger(err);
    if (err.message === 'Network Error' || err.message === 'Failed to fetch') {
      // Toast({ title: "NoInternetConnection", type: "error", timeout: 10000 });
      return err
    }

    let response = err.response
    if (response?.status !== 404) {
      if (err.config?.url?.includes('login')) {
        // Toast({ title: "RongPasswordOrPhoneNumber", type: "error" });
      } else {
        // let details = response?.data?.details || ErrorTitles.Error;
        // let errText = ErrorTitles[details] || details;
        // Toast({ title: "Error", content: response?.data?.details, type: "error" });
      }
    } else if (response.status === 401) {
      localStorage.removeItem('token')
    }
    return err
  }
  getStored = (store_key) =>
    JSON.parse(this.storage.getItem(this.getCleanString(store_key)))
  removeStorage = (store_key) =>
    this.storage.removeItem(this.getCleanString(store_key))
  setStorage = (store_key, data) =>
    Object.values(data).length > 0
      ? this.storage.setItem(
          this.getCleanString(store_key),
          JSON.stringify(data)
        )
      : this.removeStorage(store_key)
  clearStorage = () => {
    for (let i = 0; i < this.storage?.length; i++) {
      let key = this.storage.key(i)
      if (key.startsWith(this.storageKey)) this.storage.removeItem(key)
    }
  }
}
