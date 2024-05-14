import { StorageType } from "../../Utils/Storable";

export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  reset: () => void;
  clearStore?: () => void;
  initialValue: HiveType;
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

export interface IProxyHive<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => IHive<NestedHiveType>;
  getNestedHive: <K extends keyof HiveType>(key: K) => IHive<HiveType[K]> | undefined;
  setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  reset: () => void;
}

export interface IFormHive<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => INestedFormHive<NestedHiveType>;
  getNestedHive: <K extends keyof HiveType>(key: K) => INestedFormHive<HiveType[K]>;
  setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  validate: (key: keyof HiveType, value: HiveType[keyof HiveType]) => void;
  errors: { [key: string]: string };
  getError: (key: keyof HiveType) => string;
  setError: (key: keyof HiveType, value: string) => void;
  clearErrors: () => void;
  isDirtyHive: IHive<boolean>;
  isValidHive: IHive<boolean>;
  reValidate: <K extends keyof HiveType>(validateKeys?: K[]) => Promise<boolean>;
  submit: <K extends keyof HiveType>(e?: React.FormEvent<HTMLFormElement>, validateKeys?: K[]) => void;
}

export interface INestedFormHive<HiveType> {
  // honey: HiveType;
  initialValue: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  clearStore?: () => void;

  honey: {
    value: HiveType;
    error?: string;
  };

  error?: string;
  setError: (err?: string) => void;
  validate: (honey: HiveType) => void;
  isValid: () => boolean;
  reset: () => void;
}

export type IStoreKey = string | { storeKey: string; storage: StorageType };
