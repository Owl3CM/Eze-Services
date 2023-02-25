export default class Utils {
  static Round = (num) => Math.round(num * 100) / 100
  static getStorage = (key) => JSON.parse(localStorage.getItem(key))
  static setStorage = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value))
  static removeAllChildNodes(parent) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
  }
  static uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }
  // static hasValue = (value) => [undefined, null, -1, "", "-1"].includes(value) === false;
  static hasValue = (value) => [undefined, null, ''].includes(value) === false
  static Formate = (amount) => {
    let newVal = `${amount}`?.replace('-', '').split('.'),
      beforPoint = newVal[0],
      length = beforPoint?.length,
      owl =
        newVal[1] && !newVal[1]?.startsWith('00')
          ? `.${newVal[1].length > 2 ? newVal[1].substring(0, 2) : newVal[1]}`
          : ''
    for (let o = length; o > 0; o -= 3)
      o - 3 > 0
        ? (owl = `,${beforPoint.substring(o, o - 3)}${owl}`)
        : (owl = beforPoint.substring(0, o) + owl)
    return amount >= 0 ? owl : `- ${owl}`
  }

  static FormateWithCurrency = (amount, currencyId) => {
    let newVal = `${amount}`?.replace('-', '').split('.'),
      beforPoint = newVal[0],
      length = beforPoint?.length,
      owl =
        newVal[1] && !newVal[1]?.startsWith('00')
          ? `.${newVal[1].length > 2 ? newVal[1].substring(0, 2) : newVal[1]}`
          : ''
    for (let o = length; o > 0; o -= 3)
      o - 3 > 0
        ? (owl = `,${beforPoint.substring(o, o - 3)}${owl}`)
        : (owl = beforPoint.substring(0, o) + owl)

    let formated = `${owl}  ${getShortCurrency(currencyId)}`
    return amount >= 0 ? formated : `${formated} -`
  }
  static generateQuery = (query, url) => {
    query = Object.entries(query).reduce((acc, [id, value]) => {
      if (Utils.hasValue(value.value)) acc[id] = value.value
      return acc
    }, {})
    return `${url ? `/${url}` : ''}?${new URLSearchParams(query)}`
  }

  static sleep = (ms = 3000) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  static setupStorage = ({ service, storageKey, storageType = 'local' }) => {
    const storage = storageType === 'local' ? localStorage : sessionStorage

    const getCleanString = (text = '') =>
      storageKey + text.replace(/[?&=/!]/g, '-')
    service.getStored = (store_key) =>
      JSON.parse(storage.getItem(getCleanString(store_key)))
    service.setStorage = (store_key, data) => {
      let _storeKey = getCleanString(store_key)
      if (Object.values(data).length > 0)
        storage.setItem(_storeKey, JSON.stringify(data))
      else storage.removeItem(_storeKey)
    }
    service.removeStored = () => {
      for (let i = 0; i < storage.length; i++) {
        let key = storage.key(i)
        if (key.startsWith(storageKey)) storage.removeItem(key)
      }
    }
  }

  static ReactToNode = ({ reactComponent, props = {} }) => {
    const fn = reactComponent?.type ?? reactComponent
    if (typeof fn === 'function') return create(fn(props))
  }
}

const create = (reactComponent) => {
  if (!reactComponent) return document.createTextNode('')
  if (typeof reactComponent === 'string')
    return document.createTextNode(reactComponent)

  let element
  if (reactComponent.type === 'svg') return createSvg(reactComponent)
  else if (typeof reactComponent.type === 'function')
    element = create(reactComponent.type(reactComponent.props))
  else element = document.createElement(reactComponent.type)

  Object.entries(reactComponent.props).map(([key, value]) => {
    if (key === 'children') return
    else if (key === 'style')
      return Object.entries(value).map(
        ([styleKey, styleValue]) => (element.style[styleKey] = styleValue)
      )
    else if (key !== 'className') key = key.toLocaleLowerCase()
    element[key] = value
  })
  if (typeof reactComponent.props.children === 'object') {
    Array.isArray(reactComponent.props.children)
      ? Object.values(reactComponent.props.children).forEach((nestedChild) =>
          element.append(create(nestedChild))
        )
      : element.append(create(reactComponent.props.children))
  } else element.append(reactComponent.props.children ?? '')
  return element
}

const createSvg = (svg) => {
  let element = document.createElementNS('http://www.w3.org/2000/svg', svg.type)
  const children = svg.props.children
  Object.entries(svg.props).map(([key, value]) => {
    if (key === 'children') return
    else if (key === 'style')
      return Object.entries(value).map(
        ([styleKey, styleValue]) => (element.style[styleKey] = styleValue)
      )
    else if (NS_KEYS[key]) {
      element.setAttribute(NS_KEYS[key], value)
    } else element.setAttribute(camelToDashCase(key).toLowerCase(), value)
  })
  if (typeof children === 'object') {
    Array.isArray(children)
      ? Object.values(children).forEach((nestedChild) =>
          element.append(createSvg(nestedChild))
        )
      : element.append(createSvg(children))
  } else element.append(children ?? '')
  return element
}

const NS_KEYS = {
  className: 'class',
  viewBox: 'viewBox'
}
const camelToDashCase = (str) =>
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
