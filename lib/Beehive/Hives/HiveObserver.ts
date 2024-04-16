import { _getHiveBase } from "./HiveBase";
import { HiveGetter, IHive } from "./Types";
import { IHiveObserver } from "./Types";

export function createHiveObserver<HiveType>(listen: HiveGetter<HiveType>): IHiveObserver<HiveType> {
  const [baseHive, _pollinate] = _getHiveBase(null as any);
  baseHive.setHoney = () => {
    throw new Error("Cannot set honey on an observable hive");
  };
  baseHive.silentSetHoney = () => {
    throw new Error("Cannot set honey on an observable hive");
  };

  const subscribed = new Set<IHive<any>>();
  const observe = <Target>(hive: IHive<Target>) => {
    let currentHoney = hive.honey;
    if (!subscribed.has(hive)) {
      subscribed.add(hive);
      hive.subscribe(pollinate);
    }
    return currentHoney;
  };

  const pollinate = async () => {
    baseHive.honey = listen(observe);
    _pollinate();
  };
  pollinate();

  return baseHive as any as IHiveObserver<HiveType>;
}
