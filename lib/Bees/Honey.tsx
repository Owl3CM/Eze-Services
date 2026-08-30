import { useHoney } from "../Hooks";
import { HoneyProps, BeeListProps, HoneyClusterProps, HoneyFieldProps, HiveCluster, ClusterValues } from "./Types";

function Honey<T>({ hive, children }: HoneyProps<T>) {
  return <>{children({ honey: useHoney(hive) })}</>;
}

function HoneyList<T>({ hive, children }: BeeListProps<T>) {
  const items = useHoney(hive);
  return <>{items.map((item: T, i: number) => children({ item, i }))}</>;
}

/**
 * Subscribes to multiple hives (read-only).
 * @constraint The `hives` object shape must be stable between renders.
 * Do not add/remove keys dynamically — this calls useHoney() per key.
 */
function HoneyCluster<T extends HiveCluster>({ hives, children }: HoneyClusterProps<T>) {
  const cell = {} as ClusterValues<T>;
  Object.entries(hives).forEach(([key, hive]) => {
    (cell as any)[key] = useHoney(hive);
  });
  return <>{children({ cell })}</>;
}

/** Read-only form field. Subscribes to a nested form hive. Provides honey, value, error, and flat TState. */
function HoneyField<T, TState = {}>({ hive, children }: HoneyFieldProps<T, TState>) {
  return <>{children({ ...useHoney(hive) })}</>;
}

Honey.List = HoneyList;
Honey.Cluster = HoneyCluster;
Honey.Field = HoneyField;

export { Honey };
