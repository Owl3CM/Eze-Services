export default class Utils {
  static Round = (num: number) => Math.round(num * 100) / 100;
  static getStorage = (key: string) => {
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : null;
  };
  static setStorage = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));
  static uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  static convertToCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  // static hasValue = (value) => [undefined, null, -1, "", "-1"].includes(value) === false;
  static hasValue = (value: any) => [undefined, null, ""].includes(value) === false;
  static Formate = (amount: any) => {
    let newVal = `${amount}`?.replace("-", "").split("."),
      beforPoint = newVal[0],
      length = beforPoint?.length,
      owl = newVal[1] && !newVal[1]?.startsWith("00") ? `.${newVal[1].length > 2 ? newVal[1].substring(0, 2) : newVal[1]}` : "";
    for (let o = length; o > 0; o -= 3) o - 3 > 0 ? (owl = `,${beforPoint.substring(o, o - 3)}${owl}`) : (owl = beforPoint.substring(0, o) + owl);
    return amount >= 0 ? owl : `- ${owl}`;
  };

  static FormateWithCurrency = (amount: any, currencyId: any) => {
    let newVal = `${amount}`?.replace("-", "").split("."),
      beforPoint = newVal[0],
      length = beforPoint?.length,
      owl = newVal[1] && !newVal[1]?.startsWith("00") ? `.${newVal[1].length > 2 ? newVal[1].substring(0, 2) : newVal[1]}` : "";
    for (let o = length; o > 0; o -= 3) o - 3 > 0 ? (owl = `,${beforPoint.substring(o, o - 3)}${owl}`) : (owl = beforPoint.substring(0, o) + owl);

    let formated = `${owl}  ${this.getShortCurrency(currencyId)}`;
    return amount >= 0 ? formated : `${formated} -`;
  };
  static getQuery = (query: any) => {
    alert("generateQuery");
    query = Object.entries(query).reduce((acc: any, [id, value]: any) => {
      if (Utils.hasValue(value.value)) acc[id] = value.value;
      return acc;
    }, {});
    // console.log({ url });
    return "?" + new URLSearchParams(query);
    // return `${url ? `/${url}` : ""}?${new URLSearchParams(query)}`;
  };

  static sleep = (ms = 3000) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  static setupStorage = ({ service, storageKey, storageType = "local" }: { service: any; storageKey: string; storageType?: string }) => {
    const storage = storageType === "local" ? localStorage : sessionStorage;

    const getCleanString = (text = "") => storageKey + text.replace(/[?&=/!]/g, "-");
    service.getStored = (store_key: string) => JSON.parse(storage.getItem(getCleanString(store_key))!);
    service.setStorage = (store_key: string, data: any) => {
      let _storeKey = getCleanString(store_key);
      if (Object.values(data).length > 0) storage.setItem(_storeKey, JSON.stringify(data));
      else storage.removeItem(_storeKey);
    };
    service.removeStored = () => {
      for (let i = 0; i < storage.length; i++) {
        let key = storage.key(i)!;
        if (key.startsWith(storageKey)) storage.removeItem(key);
      }
    };
  };
  static getShortCurrency = (currencyId: any) => {
    const currency: any = { 1: "د.ع", 2: "USD", 3: "EUR" };
    return currency[currencyId] || "-";
  };
}
