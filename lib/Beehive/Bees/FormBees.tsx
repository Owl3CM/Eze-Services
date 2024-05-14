import React from "react";
import { FormBeesProps } from "./Types";
import { useHoney } from "../Hooks";

export default function FormBees<HiveType = any>({ hiveCluster, Component }: FormBeesProps<HiveType>) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    const { value, error } = (useHoney as any)(hive);
    cell[key] = { value, error };
  });
  const set = (newValues: { [key: keyof typeof hiveCluster]: any }, replace = false) => {
    if (replace) Object.entries(hiveCluster).forEach(([key, hive]: any) => hive.setHoney(newValues[key]));
    else Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].setHoney(value));
  };
  const validate = (newValues: { [key: keyof typeof hiveCluster]: any }) => {
    Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].validate(value));
  };

  return <Component cell={cell} set={set} validate={validate as any} />;
}
