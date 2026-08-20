// Path: lib/Hives/HiveBase.ts (Simplified)
import { StorageType } from "../utils/Storable";
import { CheckSimilarity, getStorable } from "./HiveUtils";
import { IHive, IHiveBase, IStoreKey } from "./Types";

// Single subscriber type that handles both cases
type Subscriber<T> = {
  callback: (newValue: T) => void;
  weakRef?: WeakRef<any>; // Optional - if provided, it's a weak subscription
};

export function _getHiveBase<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IHiveBase<HiveType> {
  const subscribers = new Set<Subscriber<HiveType>>();

  const pollinate = () => {
    for (const subscriber of subscribers) {
      if (subscriber.weakRef) {
        // Weak subscription - check if instance is still alive
        const instance = subscriber.weakRef.deref();
        if (instance) {
          // Instance alive, call callback
          subscriber.callback(baseHive.honey);
        } else {
          // Instance dead, remove directly
          subscribers.delete(subscriber);
        }
      } else {
        // Regular subscription - always call
        subscriber.callback(baseHive.honey);
      }
    }
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

    // ✅ Single subscribe method with optional instance parameter
    subscribe: (callback, instance?: any) => {
      if (baseHive.honey !== initialValue) callback(baseHive.honey);

      const subscriber: Subscriber<HiveType> = {
        callback,
        weakRef: instance ? new WeakRef(instance) : undefined,
      };

      subscribers.add(subscriber);

      return () => {
        subscribers.delete(subscriber);
      };
    },

    _subscribers: () => subscribers.size,

    reset: () => baseHive.setHoney(initialValue),
  };

  // ✅ Original storage logic unchanged
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
