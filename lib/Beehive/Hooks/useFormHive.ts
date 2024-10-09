import { INestedFormHive } from "../Hives/Types";
import useFormHoney from "./useFormHoney";

export default function useFormHive<HiveType>(hive: INestedFormHive<HiveType>) {
  return [useFormHoney(hive), hive.validate] as [
    {
      value: HiveType;
      error?: string;
    },
    (honey: HiveType, effect?: boolean) => void
  ];
}
