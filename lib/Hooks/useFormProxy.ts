import { IFormHive } from "../Hives/Types";
import useFormHoney from "./useFormHoney";

export default function useFormProxy<T, K extends keyof T>(hive: IFormHive<T>, id: K) {
  const nested = hive.getNestedHive(id);
  return useFormHoney(nested);
}
