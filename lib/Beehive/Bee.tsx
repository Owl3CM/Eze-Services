import React from "react";
import { IHiveArray, useHoney } from "./Hive";

type Object = { [key: string]: any };

type BeeProps = {
  hive: any;
  Component: (props: { honey: any; setHoney: any }) => any;
};
type BeesProps = {
  hiveCluster: Object;
  Component: (props: { cell: Object; set: (newValues: Object, replace?: boolean) => void }) => any;
};

export const Bee = ({ hive, Component }: BeeProps) => <Component honey={useHoney(hive)} setHoney={hive.setHoney} />;

export const Bees = ({ hiveCluster, Component }: BeesProps) => {
  const cell = {} as any;
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive);
  });
  const set = (newValues: Object, replace = false) => {
    if (replace) Object.entries(hiveCluster).forEach(([key, hive]) => hive.setHoney(newValues[key]));
    else Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].setHoney(value));
  };
  return <Component cell={cell} set={set} />;
};

type HiveObserverProps = {
  hive: any;
  Component: (props: { honey: Object }) => any;
};
export const HiveObserver = ({ hive, Component }: HiveObserverProps) => <Component honey={useHoney(hive)} />;

type MultiHiveObserverProps = {
  hiveCluster: Object;
  Component: (props: { cell: Object }) => any;
};

export const MultiHiveObserver = ({ hiveCluster, Component }: MultiHiveObserverProps) => {
  const cell = {} as any;
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive);
  });
  return <Component cell={cell} />;
};

type BeeForArrayProps = {
  hive: IHiveArray<any>;
  Component: (props: { honey: any; i: number }) => any;
};
export const BeeForArray = ({ hive, Component }: BeeForArrayProps) => {
  console.log("BeeForArray", hive);

  return useHoney(hive).map((item: any, i: number) => <Component key={item.id} honey={item} i={i} />);
};
