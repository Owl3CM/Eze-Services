import { useHoney, useFormHoney } from "../Hooks";
import { HoneyProps, HoneyFormProps, BeeListProps, HoneyClusterProps, HiveCluster, ClusterValues } from "./Types";

function Honey<T>({ hive, children }: HoneyProps<T>) {
  return <>{children({ honey: useHoney(hive) })}</>;
}

function HoneyForm<T>({ hive, children }: HoneyFormProps<T>) {
  const { value, error } = useFormHoney(hive);
  return <>{children({ value, error })}</>;
}

function HoneyList<T>({ hive, children }: BeeListProps<T>) {
  const items = useHoney(hive);
  return <>{items.map((item: T, i: number) => children({ item, i }))}</>;
}

function HoneyCluster<T extends HiveCluster>({ hives, children }: HoneyClusterProps<T>) {
  const cell = {} as ClusterValues<T>;
  Object.entries(hives).forEach(([key, hive]) => {
    (cell as any)[key] = useHoney(hive);
  });
  return <>{children({ cell })}</>;
}

Honey.Form = HoneyForm;
Honey.List = HoneyList;
Honey.Cluster = HoneyCluster;

export { Honey };
