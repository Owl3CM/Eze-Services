import { _getHiveBase } from "./HiveBase";
import { IHive, IStoreKey } from "./Types";

export function createHive<HiveType = any>(initialValue: HiveType, storeKey?: IStoreKey): IHive<HiveType> {
  return _getHiveBase(initialValue, storeKey)[0];
}
