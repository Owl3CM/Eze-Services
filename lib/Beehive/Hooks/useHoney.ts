import { useEffect, useState } from "react";
import { IHive, IHiveArray, IHiveObserver, INestedFormHive } from "../Hives/Types";

export default function useHoney<HiveType>(hive: IHive<HiveType> | IHiveObserver<HiveType> | IHiveArray<HiveType> | INestedFormHive<HiveType>) {
  const [, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return hive.honey;
}
