import React from "react";
import { BeeProps } from "./Types";
import { useHoney } from "../Hooks";

export default function Bee<HiveType = any>({ hive, Component }: BeeProps<HiveType>) {
  return <Component honey={useHoney(hive)} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} />;
}
