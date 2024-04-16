export default class Storable {
  storage: Storage;
  storeKey: string;
  set = (store_key: string, data: any) =>
    Object.values(data).length > 0 ? this.storage.setItem(this.getCleanString(store_key), JSON.stringify(data)) : this.remove(store_key);
  get = (store_key: string) => JSON.parse(this.storage.getItem(this.getCleanString(store_key)) as string);

  insert = (key: string, value: Array<any> | Object) => {
    const isArray = Array.isArray(value);
    const _stored = this.get(key) ?? (isArray ? [] : {});
    let toStore = value;
    if (Object.keys(_stored)?.length) {
      if (isArray) toStore = [...(_stored as any[]), ...(toStore as any[])];
      else if (typeof toStore === "object") toStore = { ..._stored, ...toStore };
    }
    this.set(key, toStore);
  };
  remove = (store_key: string) => this.storage.removeItem(this.getCleanString(store_key));
  clear = (storageKey?: string) => {
    if (storageKey) {
      for (let i = 0; i < this.storage?.length; i++) {
        let key = this.storage.key(i) as string;
        if (key.startsWith(this.getCleanString(storageKey))) this.storage.removeItem(key);
      }
    } else
      for (let i = 0; i < this.storage?.length; i++) {
        let key = this.storage.key(i) as string;
        if (key.startsWith(this.storeKey)) this.storage.removeItem(key);
      }
  };
  select = (key: string, value: any) => (this.get(key) ?? [])[value];

  private getCleanString = (text = "") => this.storeKey + text.replace(/[?&=/!]/g, "-");

  constructor({ storage = "sessionStorage", storeKey = "storable" }: StorableConstructor) {
    this.storage = {} as Storage;
    if (storage === "localStorage") this.storage = localStorage;
    else if (storage === "sessionStorage") this.storage = sessionStorage;
    else if (storage === "memoryStorage") this.storage = getMemoryStorage();
    else if (storage instanceof Storage) this.storage = storage;
    else (storage as any) = null;
    this.storeKey = storeKey;
  }
  static clear = (storage: "localStorage" | "sessionStorage", storageKey: string) => {
    let _storage = storage === "localStorage" ? localStorage : sessionStorage;
    for (let i = 0; i < _storage?.length; i++) {
      let key = _storage.key(i) as string;
      if (key.startsWith(storageKey)) _storage.removeItem(key);
    }
  };
}
export type StorageType = "localStorage" | "sessionStorage" | "memoryStorage" | Storage;
type StorableConstructor = {
  storage?: StorageType;
  storeKey?: string;
};

export type IStorable = InstanceType<typeof Storable>;

function getMemoryStorage() {
  const memoryStorage: any = {
    getItem: (key: string) => memoryStorage[key] ?? null,
    setItem: (key: string, value: any) => {
      memoryStorage[key] = value;
      memoryStorage.length++;
    },
    removeItem: (key: string) => {
      delete memoryStorage[key];
      memoryStorage.length--;
    },
    key: (index: number) => Object.keys(memoryStorage)[index] ?? null,
    length: 0,
  };
  return memoryStorage as Storage;
}
