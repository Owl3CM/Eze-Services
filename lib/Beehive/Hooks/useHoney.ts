import { useEffect, useState } from "react";
import { IHive, IHiveArray, IHiveObserver } from "../Hives/Types";

export default function useHoney<HiveType>(hive: IHive<HiveType> | IHiveObserver<HiveType> | IHiveArray<HiveType>) {
  const [value, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return value;
}
