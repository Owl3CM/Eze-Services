import { useEffect, useState } from "react";
import { INestedFormHive } from "../Hives/Types";

export default function useFormHoney<HiveType>(hive: INestedFormHive<HiveType>) {
  const [, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return hive.honey as {
    value: HiveType;
    error?: string;
  };
}
