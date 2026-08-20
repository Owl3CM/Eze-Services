import React from "react";
import { FormFieldSetter, IHive, IHiveList, IHiveObserver, INestedFormHive, IProxyHive } from "../Hives/Types";

// ─── Honey (Read-Only) ──────────────────────────────────────────────────────

export type HoneyChildrenArgs<T> = { honey: T };

export type HoneyProps<T> = {
  hive: IHive<T> | IHiveObserver<T>;
  children: (args: HoneyChildrenArgs<T>) => React.ReactNode;
};

export type HoneyFieldChildrenArgs<T, TState = {}> = {
  value: T;
  error?: string;
} & TState;

export type HoneyFieldProps<T, TState = {}> = {
  hive: INestedFormHive<T, TState>;
  children: (args: HoneyFieldChildrenArgs<T, TState>) => React.ReactNode;
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

export type BeeFieldChildrenArgs<T, TState = {}> = {
  value: T;
  validate: (value: T, effect?: boolean) => void;
  error?: string;
  set: FormFieldSetter<T, TState>;
  setValue: (value: T | ((prev: T) => T)) => void;
  setState: (state: Partial<TState>) => void;
} & TState;

export type BeeFieldProps<T, TState = {}> = {
  hive: INestedFormHive<T, TState>;
  children: (args: BeeFieldChildrenArgs<T, TState>) => React.ReactNode;
};

export type BeeListChildrenArgs<T> = { item: T; i: number };

export type BeeListProps<T> = {
  hive: IHiveList<T>;
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

export type HiveCluster = Record<string, IHive<any> | IHiveObserver<any> | IHiveList<any>>;

export type ClusterValues<T extends HiveCluster> = {
  [K in keyof T]: T[K] extends IHive<infer V> | IHiveObserver<infer V> ? V : T[K] extends IHiveList<infer V> ? V[] : never;
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
