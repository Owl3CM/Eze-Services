import React from "react";
import { useHoney } from "../Hooks";
import { ObserverBeeProps } from "./Types";

export default function ObserverBee<HiveType = any>({ hive, Component }: ObserverBeeProps<HiveType>) {
  return <Component honey={useHoney(hive)} />;
}
