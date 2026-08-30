import useHoney from "./useHoney";
import { HiveCluster, ClusterValues } from "../Bees/Types";

export default function useCluster<T extends HiveCluster>(hives: T): ClusterValues<T> {
  const cell = {} as ClusterValues<T>;
  Object.entries(hives).forEach(([key, hive]) => {
    (cell as any)[key] = useHoney(hive);
  });
  return cell;
}
