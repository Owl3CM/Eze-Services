import { IHive, IHiveArray, IHiveObserver } from "../Hives/Types";

export type KeyValueHive = { [key: string]: IHive<any> };
export type KeyValueHiveObserver = { [key: string]: IHiveObserver<any> };

export type BeeProps<HiveType> = {
  hive: IHive<HiveType>;
  Component: (props: { honey: HiveType; setHoney: (prev: HiveType) => void; silentSetHoney: (prev: HiveType) => void }) => any;
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
