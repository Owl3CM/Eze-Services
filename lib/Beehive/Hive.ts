import { useState, useEffect } from "react";
import Storable from "../Utils/Storable";

const storable = new Storable({ storeKey: "BeehiveStore_", storage: "memoryStorage" });

export const clearHiveStorage = (storeKey?: string) => storable.clear(storeKey);
export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
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

export function useHoney<HiveType>(hive: IHive<HiveType>) {
  const [value, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return value;
}

export function useHive<HiveType>(hive: IHive<HiveType>) {
  return [useHoney(hive), hive.setHoney];
}

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
