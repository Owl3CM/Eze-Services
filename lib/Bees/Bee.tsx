import { useHoney } from "../Hooks";
import { BeeProps, BeeClusterProps, BeeFieldProps, HiveCluster, ClusterValues, BeeProxyProps } from "./Types";
import { IProxyHive } from "../Hives/Types";

function Bee<T>({ hive, children }: BeeProps<T>) {
  return <>{children({ honey: useHoney(hive), set: hive.setHoney, silentSet: hive.silentSetHoney })}</>;
}

function BeeProxy<T>({ hive, id, children }: BeeProxyProps<T>) {
  const nested = hive.getNestedHive(id) as IProxyHive<T[keyof T]>;
  return <>{children({ honey: useHoney(nested), set: nested.setHoney, silentSet: nested.silentSetHoney })}</>;
}

/**
 * Subscribes to multiple hives and provides read + write access.
 * @constraint The `hives` object shape must be stable between renders.
 * Do not add/remove keys dynamically — this calls useHoney() per key.
 */
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

/** Subscribes to a form field hive. Provides honey, value, set, validate, error. */
function BeeField<T>({ hive, children }: BeeFieldProps<T>) {
  const honey = useHoney(hive);
  return <>{children({ honey, value: honey.value, set: hive.setHoney, validate: hive.validate, error: honey.error })}</>;
}

Bee.Proxy = BeeProxy;
Bee.Field = BeeField;
Bee.Cluster = BeeCluster;

export { Bee };
