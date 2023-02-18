export default class Mock {
  constructor() {}
  static GenerateItem = (i) => {
    return {
      i,
      id: i,
      name: `Item ${i}`,
      description: `Description ${i}`,
      name: `name ${i}`,
      wholeSalePrice: `wholeSalePrice ${i}`,
      morabaaId: `morabaaId ${i}`,
      words: Mock.GenerateWords(Math.random() * 100)
    }
  }
  static GenerateItems = (limit, offset = 0) => {
    offset = parseInt(offset) || 0
    limit = parseInt(limit)
    console.log({ limit, offset })
    limit += offset
    let items = []
    for (let i = offset; i < limit; i++) {
      items.push(Mock.GenerateItem(i))
    }
    return items
  }

  static GenerateWords = (count) => {
    let words = []
    for (let i = 0; i < count; i++) {
      words.push(`${Math.round(Math.random())} /  ${i}`)
    }
    return words.join()
  }
}
