import React from "react";
import { useHoney } from "../Hooks";
import { ArrayBeeProps } from "./Types";

export default function ArrayBee<HiveType = any>({ hive, Component }: ArrayBeeProps<HiveType>) {
  return useHoney(hive).map((item: any, i: number) => <Component key={item.id} honey={item} i={i} />);
}
