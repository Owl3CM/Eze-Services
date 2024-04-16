import { IHive } from "../Hives/Types";
import useHoney from "./useHoney";

export default function useHive<HiveType>(hive: IHive<HiveType>) {
  return [useHoney(hive), hive.setHoney];
}
