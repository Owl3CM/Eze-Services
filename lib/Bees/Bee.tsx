import { useHoney, useFormHoney } from "../Hooks";
import { BeeProps, BeeFormProps, BeeProxyProps, BeeClusterProps, HiveCluster, ClusterValues } from "./Types";
import { IProxyHive } from "../Hives/Types";

function Bee<T>({ hive, children }: BeeProps<T>) {
  return <>{children({ honey: useHoney(hive), set: hive.setHoney, silentSet: hive.silentSetHoney })}</>;
}

function BeeForm<T>({ hive, children }: BeeFormProps<T>) {
  const { value, error } = useFormHoney(hive);
  return <>{children({ value, set: hive.setHoney, error, validate: hive.validate })}</>;
}

function BeeProxy<T>({ hive, id, children }: BeeProxyProps<T>) {
  const nested = hive.getNestedHive(id) as IProxyHive<T[keyof T]>;
  return <>{children({ honey: useHoney(nested), set: nested.setHoney, silentSet: nested.silentSetHoney })}</>;
}

function BeeCluster<T extends HiveCluster>({ hives, children }: BeeClusterProps<T>) {
  const cell = {} as ClusterValues<T>;
  Object.entries(hives).forEach(([key, hive]) => {
    (cell as any)[key] = useHoney(hive);
  });
  const set = (values: Partial<ClusterValues<T>>) => {
    Object.entries(values).forEach(([key, value]) => {
      (hives as any)[key]?.setHoney(value);
    });
  };
  return <>{children({ cell, set })}</>;
}

Bee.Form = BeeForm;
Bee.Proxy = BeeProxy;
Bee.Cluster = BeeCluster;

export { Bee };
