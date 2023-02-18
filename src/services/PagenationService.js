import Utils from '../utils/Utils'
export default class PagenationService {
  /**
   * @typedef {Object} PagenationService
   * @property {Array} items
   * @property {Function} setItems
   * @property {string} state
   * @property {Function} setState
   * @property {number} offset
   * @property {number} limit
   * @property {string} query
   * @property {boolean} canFetch
   * @property {Object} queryParams
   * @property {Function} callback
   * @property {Function} onResult
   * @property {Function} onError
   * @property {Function} loadMore
   * @property {Function} search
   * @property {Function} reload
   * @property {boolean} useCash
   * @property {string} storageKey
   * @property {Object} storage
   * @property {Function} constructor
   * @param {Object} props           - PagenationService props
   * @param {Function} props.onResult
   * @param {string} props.storageKey
   * @param {Object} props.storage
   * @param {Function} props.callback
   * @param {boolean} props.useCash
   * @param {number} props.limit
   * @param {string} props.endpoint
   * @returns {PagenationService}
   * @example
   * const service = new PagenationService({
   *    onResult: (result, service) => {
   *       service.setItems(result.items);
   *      service.setState("none");
   *     service.canFetch = true;
   *   },
   * storageKey: "key",
   * storage: localStorage,
   * callback: (query) => fetch(query),
   * useCash: true,
   * limit: 25,
   * endpoint: "endpoint",
   * });
   * service.search();
   */
  items = []
  setItems = (items, clear) => {
    this.items = clear ? items : [...this.items, ...items]
  }

  state = 'none'
  setState = (state) => {
    this.state = state
  }

  offset = 0
  limit = 25
  query = ''
  canFetch = false
  // autoFetch? = false;
  queryParams = {}
  callback

  onResult = (result, service) => {
    return result
  }
  onError = (error, service) => {}

  loadMore = async () => {}
  search = async () => {}
  reload = async () => {}

  #_init = false

  constructor({
    onResult,
    storageKey,
    storage,
    callback,
    useCash = false,
    limit = 25,
    endpoint
  }) {
    this.useCash = useCash && !!storageKey
    if (this.useCash) {
      this.storageKey = storageKey
      this.storage = storage
      this.getCleanString = (text = '') =>
        storageKey + text.replace(/[?&=/!]/g, '-')
    }
    // this.autoFetch = autoFetch;
    this.onResult = onResult
    this.limit = limit
    this.callback = callback
    this.search = async () => {
      this.canFetch = false
      this.offset = 0
      if (!this.queryParams.limit && this.limit)
        this.queryParams.limit = { value: this.limit, title: '_' }

      this.query = Utils.generateQuery(this.queryParams, endpoint)

      if (this.useCash) {
        let cashItems = this.getStored(this.query)
        if (cashItems) {
          if (!this.#_init) {
            this.#_init = true
            this.items = cashItems
          } else this.setItems(cashItems)
          this.offset = cashItems.length
          this.setState('none')
          setTimeout(() => {
            this.canFetch = true
          }, 10)
          return
        }
      }
      this.state = 'searching'
      this.setState('searching')
      try {
        const result = await this.callback(this.query)
        this.#onResult(result, this)
      } catch (error) {
        this.#onError(error, this)
      }
    }

    this.reload = async () => {
      this.canFetch = false
      this.offset = 0
      this.query = Utils.generateQuery(this.queryParams, endpoint)
      this.setState('reloading')
      try {
        const result = await this.callback(this.query)
        this.clearStorage()
        this.#onResult(result, this)
      } catch (error) {
        this.#onError(error, this)
      }
    }

    this.loadMore = async () => {
      this.canFetch = false
      let query = this.query + `&offset=${this.offset}`
      this.setState('itemsLoading')
      try {
        const result = await this.callback(query)
        this.#onResult(result, this)
      } catch (error) {
        this.#onError(error, this)
      }
    }
  }

  initQueryParams = (values) => {
    this.queryParams = values
    this.search()
  }
  setQueryParmas = (values) => {
    this.queryParams = values
    this.search()
  }
  updateQueryParams = (queryParma = { value: 'jhon', title: 'the name' }) => {
    console.log(this.queryParams.value)
    if (Utils.hasValue(queryParma.value)) {
      this.queryParams[queryParma.id] = {
        value: queryParma.value,
        title: queryParma.title || '_'
      }
    } else delete this.queryParams[queryParma.id]

    this.search()
  }

  #onError = (error, service) => {
    console.log(error)
    service.onError(error, service)
    if (error.stack) error = { message: error.message, stack: error.stack }
    service.setState({ state: 'error', error })
  }

  #onResult = async (data, service) => {
    if (service.onResult) {
      let modfied = await service.onResult(data, service)
      if (modfied) data = modfied
    }
    let items = []
    let _data = {}
    if (!Array.isArray(data)) {
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) items = value
        else _data[key] = value
      })
    } else items = data || []

    if (service.useCash) {
      if (service.offset === 0) {
        let allCashQueries = service.getStored('') || []
        if (!allCashQueries.includes(service.query)) {
          allCashQueries.push(service.query)
          service.setStorage('', allCashQueries)
        }
        service.setStorage(service.query, items)
      } else {
        let oldItems = service.getStored(service.query) || []
        service.setStorage(service.query, [...oldItems, ...items])
      }
    }

    if (service.offset === 0) service.setItems(items, true)
    else service.setItems((_prev) => [..._prev, ...items])

    service.offset += items.length

    setTimeout(() => {
      service.canFetch = !!(service.limit && items.length >= service.limit)
    }, 100)

    // if (service.autoFetch) {
    //     const scroller = document.getElementById(service.scrollerId);
    //     console.log(service.scrollerId, scroller);
    //     setTimeout(() => {
    //         scroller && scroller.scrollTo({ top: scroller.scrollHeight, left: 0, behavior: "auto" });
    //     }, 100);
    // } else
    service.setState(
      service.items.length > 0 || items.length > 0 ? 'none' : 'noData'
    )
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
    this.setItems([])
  }
}
