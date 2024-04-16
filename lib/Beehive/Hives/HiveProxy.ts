import { createHive } from "./Hive";
import { IHive, IStoreKey } from "./Types";

export function createHiveProxy<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IHive<HiveType> {
  const hiveProxy = createHive(initialValue, storeKey) as IHiveProxy<HiveType>;
  const HIVES = new Map<string, IHive<any>>();

  hiveProxy.createNestedHive = <NestedHiveType>(initialValue: NestedHiveType, key: string, storeKey?: string) => {
    const nestedHive = createHive(initialValue, storeKey) as IHive<NestedHiveType>;
    nestedHive.subscribe((newValue: any) => {
      hiveProxy.silentSetHoney({ ...hiveProxy.honey, [key]: newValue });
    });
    hiveProxy.subscribe((newValue: any) => {
      if (typeof newValue !== "object") return;
      if (newValue[key] !== nestedHive.honey) {
        nestedHive.setHoney(newValue[key]);
      }
    });
    HIVES.set(key, nestedHive);
    return nestedHive;
  };

  hiveProxy.setValue = (key: string, value: any) => {
    const nestedHive = HIVES.get(key);
    if (nestedHive) nestedHive.setHoney(value);
  };

  // hiveProxy.getValue = (key: string) => hiveProxy.honey[key];

  hiveProxy.getValues = () => {
    const values: any = {};
    HIVES.forEach((nestedHive, key) => {
      values[key] = nestedHive.honey;
    });
    return values;
  };

  hiveProxy.setValues = (values: any) => {
    Object.entries(values).forEach(([key, value]) => {
      const nestedHive = HIVES.get(key);
      if (nestedHive) nestedHive.setHoney(value);
    });
  };

  return hiveProxy;
}

interface IHiveProxy<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(initialValue: NestedHiveType, key: string, storeKey?: string) => IHive<NestedHiveType>;
  setValue: (key: string, value: any) => void;
  getValue: (key: string) => any;
  getValues: () => any;
  setValues: (values: any) => void;
  getKeys: () => string[];
  removeKey: (key: string) => void;
  removeKeys: (keys: string[]) => void;
  clear: () => void;
  reset: () => void;
}
