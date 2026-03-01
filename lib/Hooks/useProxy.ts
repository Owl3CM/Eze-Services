import { IProxyHive } from "../Hives/Types";
import useHoney from "./useHoney";

export default function useProxy<T, K extends keyof T>(hive: IProxyHive<T>, id: K): [T[K], (value: T[K]) => void] {
  const nested = hive.getNestedHive(id) as IProxyHive<T[K]>;
  return [useHoney(nested), nested.setHoney];
}
