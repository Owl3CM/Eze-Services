const hasValue = (value) => [undefined, null, ''].includes(value) === false

const generateQuery = (query, url) => {
  query = Object.entries(query).reduce((acc, [id, value]) => {
    if (hasValue(value.value)) acc += `${id}=${value.value}&`
    return acc
  }, '')
  return `${url ? `/${url}` : ''}?${query.trimEnd('&')}`
}

const _onError = (error, service) => {
  if (error.stack) error = { message: error.message, stack: error.stack }
  service.setState({ state: 'error', props: { error } })
}

export default class Service {
  data = []
  setData = (items, clear) => {
    this.data = clear ? items : [...this.data, ...items]
  }

  state = 'idle'
  setState = ({ state = 'idle', parentId, props }) => {
    this.state = state
  }

  query = ''
  queryParams = {}

  load = async () => {}
  reload = async () => {}

  constructor({
    onResponse,
    onError = _onError,
    queryGenerator = generateQuery,
    callback
  }) {
    this.onError = onError
    this.onResponse = onResponse
    this.callback = callback

    this.load = async () => {
      this.query = queryGenerator(this.queryParams, endpoint)
      this.setState('searching')
      try {
        let result = await this.callback(this.query)
        if (this.onResponse)
          result = (await this.onResponse(result, this)) ?? result

        setData(result, true)

        if (this.state === 'searching')
          this.setState(
            this.data.length > 0 || items.length > 0 ? 'none' : 'noContent'
          )
      } catch (error) {
        this.onError(error, this)
      }
    }

    this.reload = async () => {
      this.query = queryGenerator(this.queryParams, endpoint)
      this.setState('reloading')
      try {
        let result = await this.callback(this.query)
        if (this.onResponse)
          result = (await this.onResponse(result, this)) ?? result

        setData(result, true)

        if (this.state === 'reloading')
          this.setState(
            this.data.length > 0 || items.length > 0 ? 'none' : 'noContent'
          )
      } catch (error) {
        this.onError(error, this)
      }
    }
  }

  setQueryParmas = (values = {}) => {
    this.queryParams = values
    this.load()
  }
  updateQueryParams = (queryParma = { value: 'jhon', title: 'the name' }) => {
    if (hasValue(queryParma.value)) {
      this.queryParams[queryParma.id] = {
        value: queryParma.value,
        title: queryParma.title || '_'
      }
    } else delete this.queryParams[queryParma.id]
    this.load()
  }
}
