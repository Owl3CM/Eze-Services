import React from "react";
import { IHive, IHiveArray, IHiveObserver, INestedFormHive, IProxyHive } from "../Hives/Types";

// ─── Utility Types ───────────────────────────────────────────────────────────

export type INestedFormHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);
export type ProxyHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);

// ─── Honey (Read-Only) ──────────────────────────────────────────────────────

export type HoneyChildrenArgs<T> = { honey: T };

export type HoneyProps<T> = {
  hive: IHive<T> | IHiveObserver<T>;
  children: (args: HoneyChildrenArgs<T>) => React.ReactNode;
};

export type HoneyFormChildrenArgs<T> = { value: T; error?: string };

export type HoneyFormProps<T> = {
  hive: INestedFormHive<T>;
  children: (args: HoneyFormChildrenArgs<T>) => React.ReactNode;
};

// ─── Bee (Read + Write) ─────────────────────────────────────────────────────

export type BeeChildrenArgs<T> = {
  honey: T;
  set: (value: T) => void;
  silentSet: (value: T) => void;
};

export type BeeProps<T> = {
  hive: IHive<T>;
  children: (args: BeeChildrenArgs<T>) => React.ReactNode;
};

export type BeeFormChildrenArgs<T> = {
  value: T;
  set: (value: T) => void;
  error?: string;
  validate: (value: T) => void;
};

export type BeeFormProps<T> = {
  hive: INestedFormHive<T>;
  children: (args: BeeFormChildrenArgs<T>) => React.ReactNode;
};

export type BeeListChildrenArgs<T> = { item: T; i: number };

export type BeeListProps<T> = {
  hive: IHiveArray<T>;
  children: (args: BeeListChildrenArgs<T>) => React.ReactNode;
};

export type BeeProxyChildrenArgs<T> = {
  honey: T;
  set: (value: T) => void;
  silentSet: (value: T) => void;
};

export type BeeProxyProps<T, K extends keyof T = keyof T> = {
  hive: IProxyHive<T>;
  id: K;
  children: (args: BeeProxyChildrenArgs<T[K]>) => React.ReactNode;
};

// ─── Cluster (Multi-Hive) ───────────────────────────────────────────────────

export type HiveCluster = Record<string, IHive<any> | IHiveObserver<any> | IHiveArray<any>>;

export type ClusterValues<T extends HiveCluster> = {
  [K in keyof T]: T[K] extends IHive<infer V> | IHiveObserver<infer V> ? V : T[K] extends IHiveArray<infer V> ? V[] : never;
};

export type HoneyClusterChildrenArgs<T extends HiveCluster> = { cell: ClusterValues<T> };

export type HoneyClusterProps<T extends HiveCluster> = {
  hives: T;
  children: (args: HoneyClusterChildrenArgs<T>) => React.ReactNode;
};

export type BeeClusterChildrenArgs<T extends HiveCluster> = {
  cell: ClusterValues<T>;
  set: (values: Partial<ClusterValues<T>>) => void;
};

export type BeeClusterProps<T extends HiveCluster> = {
  hives: T;
  children: (args: BeeClusterChildrenArgs<T>) => React.ReactNode;
};
