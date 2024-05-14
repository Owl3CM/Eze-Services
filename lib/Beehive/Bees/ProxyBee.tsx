import React from "react";
import { useHoney } from "../Hooks";

export default function ProxyBee<HiveType>({ hive, Component }: any) {
  return <Component honey={useHoney(hive)} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} />;
}
