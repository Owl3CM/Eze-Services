import React from "react";
import { useHoney } from "../Hooks";
import { IProxyHive } from "../Hives/Types";

interface ControllerElementProps<T> {
  hive: IProxyHive<T>;
  id: keyof T;
  Component: React.ComponentType<{ honey: T[keyof T]; setHoney: (value: T[keyof T]) => void; silentSetHoney: (value: T[keyof T]) => void }>;
}

export default function ProxyBee<HiveType>({ hive, Component, id }: ControllerElementProps<HiveType>) {
  const _hive = hive.getNestedHive(id) as IProxyHive<HiveType[keyof HiveType]>;
  return <Component honey={useHoney(_hive)} setHoney={_hive.setHoney} silentSetHoney={_hive.silentSetHoney} />;
}
