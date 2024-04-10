import { useState, useEffect } from "react";
import Storable from "../Utils/Storable";

const storable = new Storable({ storeKey: "BeehiveStore_", storage: "memoryStorage" });

export const clearHiveStorage = (storeKey?: string) => storable.clear(storeKey);
export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
}

export interface IHiveObserver<HiveType> {
  honey: any;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
}

type hiveGetter<HiveType> = (get: <Target>(a: IHive<Target>) => Target) => HiveType;
type LocalCreateHive<HiveType> = [IHive<HiveType>, Set<(newValue: HiveType) => void>];

function localCreateHive<HiveType>(initialValue: HiveType, isObservable?: boolean): LocalCreateHive<HiveType> | IHive<HiveType> {
  const subscribers = new Set<(newValue: HiveType) => void>();

  const pollinate = async () => subscribers.forEach((callback) => callback(_localHive.honey));

  const _localHive: IHive<HiveType> = {
    honey: initialValue,
    setHoney: isObservable
      ? () => {
          throw new Error("Cannot set honey on an observable hive");
        }
      : (newValue: any) => {
          _localHive.honey = typeof newValue === "function" ? newValue(_localHive.honey) : newValue;
          pollinate();
        },
    silentSetHoney: isObservable
      ? () => {
          throw new Error("Cannot set honey on an observable hive");
        }
      : (newValue: any) => {
          _localHive.honey = newValue;
        },
    subscribe: (callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    _subscribers: () => subscribers.size,
  };

  pollinate();

  return isObservable ? [_localHive, subscribers] : _localHive;
}

export const createHive = <HiveType>(initialValue: HiveType, storeKey?: string): IHive<HiveType> => {
  const observer = localCreateHive(initialValue, false) as IHive<HiveType>;
  if (storeKey) {
    const storedValue = storable.get(storeKey);
    if (storedValue) observer.setHoney(storedValue);
    observer.subscribe((newValue: any) => storable.set(storeKey, newValue));
  }
  return observer;
};

export const createHiveObserver = <HiveType>(observe: hiveGetter<HiveType>): IHiveObserver<HiveType> => {
  const [observer, subscribers] = localCreateHive(null as any, true) as LocalCreateHive<HiveType>;

  const subscribed = new Set<IHive<any>>();
  const get = <Target>(hive: IHive<Target>) => {
    let currentValue = hive.honey;
    if (!subscribed.has(hive)) {
      subscribed.add(hive);
      hive.subscribe(function (newValue) {
        if (currentValue === newValue) return;
        currentValue = newValue;
        pollinate();
      });
    }
    return currentValue;
  };
  let pollinate = async () => {
    observer.honey = (observe as hiveGetter<HiveType>)(get);
    subscribers.forEach((callback) => callback(observer.honey));
  };
  pollinate();
  return observer;
};

export interface IHiveArray<HiveType> {
  honey: HiveType[];
  setHoney: (newValue: HiveType[] | ((prev: HiveType[]) => HiveType[])) => void;
  silentSetHoney: (newValue: HiveType[]) => void;
  subscribe: (callback: (newValue: HiveType[]) => void) => () => void;
  _subscribers: () => number;
  push: (newValue: HiveType) => void;
  pop: () => void;
  shift: () => void;
  unshift: (newValue: HiveType) => void;
  splice: (start: number, deleteCount: number, ...items: HiveType[]) => void;
  remove: (id: any) => void;
  removeById: (index: number) => void;
  append: (items: HiveType[]) => void;
  update: () => void;
  updateById: (id: any, newValue: HiveType) => void;
  updateByIndex: (index: number, newValue: HiveType) => void;
}

export function createHiveArray<HiveType>(initialValue: HiveType[], storeKey?: string): IHiveArray<HiveType> {
  const hive = createHive(initialValue, storeKey) as any as IHiveArray<HiveType>;
  const hiveArray = hive;

  hiveArray.push = (newValue: HiveType) => hive.setHoney((prev) => [...prev, newValue]);
  hiveArray.pop = () => hive.setHoney((prev) => prev.slice(0, -1));
  hiveArray.shift = () => hive.setHoney((prev) => prev.slice(1));
  hiveArray.unshift = (newValue: HiveType) => hive.setHoney((prev) => [newValue, ...prev]);
  hiveArray.splice = (start: number, deleteCount: number, ...items: HiveType[]) =>
    hive.setHoney((prev) => [...prev.slice(0, start), ...items, ...prev.slice(start + deleteCount)]);
  hiveArray.removeById = (id: any) => hive.setHoney((prev) => prev.filter((item: any) => item.id !== id));
  hiveArray.remove = (index: number) => hive.setHoney((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  hiveArray.append = (items: HiveType[]) => hive.setHoney((prev) => [...prev, ...items]);
  hiveArray.update = () => hive.setHoney((prev) => [...prev]);
  hiveArray.updateByIndex = (index: number, newValue: HiveType) =>
    hive.setHoney((prev) => {
      prev[index] = newValue;
      return [...prev];
    });
  hiveArray.updateById = (id: any, newValue: HiveType) => hive.setHoney((prev) => prev.map((item: any) => (item.id === id ? newValue : item)));

  return hiveArray;
}
// return [useSyncExternalStore(hive.subscribe, () => hive.honey as any), hive.setHoney];

export function useHoney<HiveType>(hive: IHive<HiveType>) {
  const [value, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return value;
}

export function useHive<HiveType>(hive: IHive<HiveType>) {
  return [useHoney(hive), hive.setHoney];
}

interface IHiveObject<HiveType> extends IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;

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
export function createHiveObject<HiveType>(initialValue: HiveType, storeKey?: string): IHive<HiveType> {
  const hiveObject = createHive(initialValue, storeKey) as IHiveObject<HiveType>;
  const HIVES = new Map<string, IHive<any>>();

  hiveObject.createNestedHive = <NestedHiveType>(initialValue: NestedHiveType, key: string, storeKey?: string) => {
    const nestedHive = createHive(initialValue, storeKey) as IHive<NestedHiveType>;
    nestedHive.subscribe((newValue: any) => {
      hiveObject.silentSetHoney({ ...hiveObject.honey, [key]: newValue });
    });
    hiveObject.subscribe((newValue: any) => {
      if (typeof newValue !== "object") return;
      if (newValue[key] !== nestedHive.honey) {
        nestedHive.setHoney(newValue[key]);
      }
    });
    HIVES.set(key, nestedHive);
    return nestedHive;
  };

  hiveObject.setValue = (key: string, value: any) => {
    const nestedHive = HIVES.get(key);
    if (nestedHive) nestedHive.setHoney(value);
  };

  hiveObject.getValue = (key: string) => hiveObject.honey[key];

  hiveObject.getValues = () => {
    const values: any = {};
    HIVES.forEach((nestedHive, key) => {
      values[key] = nestedHive.honey;
    });
    return values;
  };

  hiveObject.setValues = (values: any) => {
    Object.entries(values).forEach(([key, value]) => {
      const nestedHive = HIVES.get(key);
      if (nestedHive) nestedHive.setHoney(value);
    });
  };

  return hiveObject;
}

// form

// type SubscribeProps = {
//   id: string;
//   setValue: (value: string) => void;
//   setError: (error: string) => void;
//   onSuccess?: () => void;
// };
// interface IFormProps<T> {
//   initialValues: T;
//   valiateSchema?: any;
//   validate?: (id: keyof T, value: any) => string;
//   setErrors?: (errors: any) => void;
//   setError: (id: keyof T, error: string) => void;
//   setValue: (id: keyof T, value: any) => void;
//   subscribeToForm: (props: SubscribeProps) => void;

//   onSubmit?: (values: T) => void;
// }

// export function createFormHive<HiveType>(initialValue: HiveType, validateSchema: any, storeKey?: string): IHive<HiveType> {
//   const formHive = createHive(initialValue, storeKey) as any as IFormProps<HiveType> & IHive<HiveType>;
//    formHive.validate = (id, value) => {
//     try {
//       validateSchema.validateSyncAt(id, { [id]: value });
//       formHive.removeError(id);
//     } catch ({ message }: any) {
//       if (!(message as any).includes("The schema does not contain the path")) {
//         formHive.addError(id, message as string);
//         return message;
//       }
//     }
//   };

//   Object.entries(initialValue as any).map(([key, value]: any) => {
//     const keyHive = createHive(value);
//     formHive.subscribeToForm({
//       id: key,
//       setValue: (value: any) => {
//         formHive.silentSetHoney({ ...formHive.honey, [key]: value });
//         keyHive.setHoney(value);
//       },
//       setError: (error: string) => {
//         keyHive.setHoney(error);
//       },
//     });
//   });

//   formHive.subscribeToForm = ({ id, setValue, setError, onSuccess }) => {
//     formHive[`set${id}`] = setValue;
//     formHive[`set${id}Error`] = setError;
//     formHive[`on${id}Success`] = onSuccess ?? setError;
//   }

//   return formHive;
// }
