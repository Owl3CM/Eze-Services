import React from "react";
import { useHoney } from "../Hooks";
import { ObserverBeesProps } from "./Types";

export default function ObserverBees({ hiveCluster, Component }: ObserverBeesProps) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive).value;
  });
  return <Component cell={cell} />;
}
