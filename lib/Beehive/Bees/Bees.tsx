import React from "react";
import { useHoney } from "../Hooks";
import { BeesProps } from "./Types";

export default function Bees({ hiveCluster, Component }: BeesProps) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive);
  });
  const set = (newValues: { [key: keyof typeof hiveCluster]: any }, replace = false) => {
    if (replace) Object.entries(hiveCluster).forEach(([key, hive]) => hive.setHoney(newValues[key]));
    else Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].setHoney(value));
  };
  return <Component cell={cell} set={set} />;
}
