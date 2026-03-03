import { useEffect, useState } from "react";
import { IHive, IHiveList, IHiveObserver, INestedFormHive } from "../Hives/Types";

export default function useHoney<HiveType>(hive: IHive<HiveType> | IHiveObserver<HiveType> | IHiveList<HiveType> | INestedFormHive<HiveType>) {
  const [, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return hive.honey;
}
