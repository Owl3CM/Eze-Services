import { StorageType } from "../../Utils/Storable";

export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  clearStore?: () => void;
}

export type HiveGetter<HiveType> = (get: <Target>(a: IHive<Target>) => Target) => HiveType;
export type IHiveBase<HiveType> = [IHive<HiveType>, () => void];

export interface IHiveObserver<HiveType> {
  honey: any;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  setHoney?: undefined;
  silentSetHoney?: undefined;
}

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
  removeById: (id: any) => void;
  removeByIndex: (index: number) => void;
  append: (items: HiveType[]) => void;
  update: () => void;
  updateById: (id: any, newValue: HiveType) => void;
  updateByIndex: (index: number, newValue: HiveType) => void;
}

export type IStoreKey = string | { storeKey: string; storage: StorageType };
