import { IHive, IHiveArray, IHiveObserver, INestedFormHive, IProxyHive } from "../Hives/Types";

export type KeyValueHive = { [key: string]: IHive<any> | IHiveArray<any> };
export type KeyValueNestedFormHive = { [key: string]: INestedFormHive<any> };
export type KeyValueHiveObserver = { [key: string]: IHiveObserver<any> | IHive<any> | INestedFormHive<any> | IHiveArray<any> };

export type HoneySetter<HiveType> = (prev: HiveType) => void | HiveType;

export type BeeProps<HiveType> = {
  hive: IHive<HiveType>;
  Component: (props: { honey: HiveType; setHoney: HoneySetter<HiveType>; silentSetHoney: HoneySetter<HiveType> }) => any;
};

export type BeesProps = {
  hiveCluster: KeyValueHive;
  Component: (props: { cell: KeyValueHive; set: (newValues: KeyValueHive, replace?: boolean) => void }) => any;
};

export type ArrayBeeProps<HiveType> = {
  hive: IHiveArray<HiveType>;
  Component: (props: { honey: HiveType; i: number }) => any;
};

export type ObserverBeeProps<HiveType> = {
  hive: IHiveObserver<HiveType> | IHive<HiveType>;
  Component: (props: { honey: HiveType }) => any;
};

export type ObserverBeesProps = {
  hiveCluster: KeyValueHiveObserver;
  Component: (props: { cell: KeyValueHiveObserver }) => any;
};

export type INestedFormHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);

export type FormBeeProps<HiveType> = {
  hive: INestedFormHive<HiveType>;
  Component: (props: {
    honey: HiveType;
    setHoney: HoneySetter<HiveType>;
    silentSetHoney: HoneySetter<HiveType>;
    error?: string;
    validate: INestedFormHoneySetter<HiveType>;
  }) => any;
};
export type FormBeesProps<HiveType> = {
  hiveCluster: KeyValueNestedFormHive;
  Component: (props: {
    cell: KeyValueNestedFormHive;
    set: (newValues: KeyValueNestedFormHive, replace?: boolean) => void;
    error?: string;
    validate: INestedFormHoneySetter<HiveType>;
  }) => any;
};

export type ProxyHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);

// export interface IProxyHive<HiveType> extends IHive<HiveType> {
//   createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => IHive<NestedHiveType>;
//   getNestedHive: <K extends keyof HiveType>(key: K) => IHive<HiveType[K]> | undefined;
//   setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
//   getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
//   subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
//   reset: () => void;
// }
// export type ProxyBeeProps<HiveType> = {
//   id: keyof HiveType;
//   hive: IProxyHive<HiveType>;
//   Component: (props: valueof IProxyHive<HiveType>.get) => any;
// };
