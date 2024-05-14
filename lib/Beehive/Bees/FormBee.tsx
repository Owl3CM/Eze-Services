import React from "react";
import { FormBeeProps } from "./Types";
import { useHoney } from "../Hooks";

export default function FormBee<HiveType = any>({ hive, Component }: FormBeeProps<HiveType>) {
  const { value, error } = useHoney(hive);
  return <Component honey={value} error={error} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} validate={hive.validate} />;
}
