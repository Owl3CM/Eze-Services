import { useHoney } from "../Hooks";
import { BeeProps, BeeClusterProps, BeeFieldProps, HiveCluster, ClusterValues, BeeProxyProps } from "./Types";
import { FormFieldSetter, IProxyHive } from "../Hives/Types";

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

/** Subscribes to a form field hive. Provides value, validation, value/state setters, error, and flat TState. */
function BeeField<T, TState = {}>({ hive, children }: BeeFieldProps<T, TState>) {
  const set = ((...args: [unknown] | [keyof TState, TState[keyof TState]]) => {
    if (args.length === 1) hive.setHoney(args[0] as T | ((prev: T) => T));
    else hive.set(args[0], args[1]);
  }) as FormFieldSetter<T, TState>;

  return <>{children({ ...useHoney(hive), validate: hive.validate, set, setValue: hive.setHoney, setState: hive.setState })}</>;
}

Bee.Proxy = BeeProxy;
Bee.Field = BeeField;
Bee.Cluster = BeeCluster;

export { Bee };
