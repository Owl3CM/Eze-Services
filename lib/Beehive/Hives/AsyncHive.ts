import { IHive, IStoreKey } from "./Types";
import { _getHiveBase } from "./HiveBase";

export function createAsyncHive<HiveType = any>(initialValue: HiveType, storeKey?: IStoreKey): IHive<HiveType> {
  const [baseHive, _pollinate] = _getHiveBase(initialValue, storeKey);

  baseHive.setHoney = async (newValue: any) => {
    if (newValue instanceof Promise) newValue = await newValue;
    if (newValue === baseHive.honey) return;
    baseHive.silentSetHoney(newValue);
    _pollinate();
  };
  return baseHive;
}
