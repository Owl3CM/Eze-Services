import { StorageType } from "../../Utils/Storable";
import { CheckSimilarity, getStorable } from "./HiveUtils";
import { IHive, IHiveBase, IStoreKey } from "./Types";

export function _getHiveBase<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IHiveBase<HiveType> {
  const subscribers = new Set<(newValue: HiveType) => void>();

  const pollinate = async () => {
    subscribers.forEach((callback) => callback(baseHive.honey));
  };

  let silentSetHoney = (newValue: any) => {
    baseHive.honey = typeof newValue === "function" ? newValue(baseHive.honey) : newValue;
  };

  const setHoney = (newValue: any) => {
    if (newValue === baseHive.honey) return;
    // if (CheckSimilarity(newValue, baseHive.honey)) return;
    baseHive.silentSetHoney(newValue);
    pollinate();
  };

  const baseHive: IHive<HiveType> = {
    initialValue,
    honey: initialValue,
    setHoney,
    silentSetHoney,
    subscribe: (callback) => {
      if (baseHive.honey !== initialValue) callback(baseHive.honey);
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    _subscribers: () => subscribers.size,
    reset: () => baseHive.setHoney(initialValue),
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
