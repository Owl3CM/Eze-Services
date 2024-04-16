import { StorageType } from "../../Utils/Storable";
import { getStorable } from "./HiveUtils";
import { IHive, IHiveBase, IStoreKey } from "./Types";

export function _getHiveBase<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IHiveBase<HiveType> {
  const subscribers = new Set<(newValue: HiveType) => void>();

  const pollinate = async () => subscribers.forEach((callback) => callback(baseHive.honey));

  let silentSetHoney = (newValue: any) => {
    baseHive.honey = typeof newValue === "function" ? newValue(baseHive.honey) : newValue;
  };

  const setHoney = (newValue: any) => {
    if (newValue === baseHive.honey) return;
    silentSetHoney(newValue);
    pollinate();
  };

  const baseHive: IHive<HiveType> = {
    honey: initialValue,
    setHoney,
    silentSetHoney,
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    _subscribers: () => subscribers.size,
  };

  if (storeKey) {
    let storage = "memoryStorage" as StorageType;
    if (typeof storeKey === "object") {
      storage = storeKey.storage;
      storeKey = storeKey.storeKey;
    }
    const Storable = getStorable(storage);

    const storedValue = Storable.get(storeKey);
    if (storedValue) baseHive.setHoney(storedValue);

    baseHive.subscribe((newValue: any) => Storable.set(storeKey, newValue));
    baseHive.clearStore = () => {
      baseHive.setHoney(initialValue);
      Storable.clear(storeKey);
    };
  } else pollinate();

  return [baseHive, pollinate];
}
