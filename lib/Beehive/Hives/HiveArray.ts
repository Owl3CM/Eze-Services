import { createHive } from "./Hive";
import { IHiveArray, IStoreKey } from "./Types";

export function createHiveArray<HiveType>(initialValue: HiveType[], storeKey?: IStoreKey): IHiveArray<HiveType> {
  const hive = createHive(initialValue, storeKey) as IHiveArray<HiveType>;

  hive.push = (newValue: HiveType) => hive.setHoney((prev) => [...prev, newValue]);
  hive.pop = () => hive.setHoney((prev) => prev.slice(0, -1));
  hive.shift = () => hive.setHoney((prev) => prev.slice(1));
  hive.unshift = (newValue: HiveType) => hive.setHoney((prev) => [newValue, ...prev]);
  hive.splice = (start: number, deleteCount: number, ...items: HiveType[]) =>
    hive.setHoney((prev) => [...prev.slice(0, start), ...items, ...prev.slice(start + deleteCount)]);
  hive.removeById = (id: any) => hive.setHoney((prev) => prev.filter((item: any) => item.id !== id));
  hive.removeByIndex = (index: number) => hive.setHoney((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  hive.remove = (index: number) => hive.setHoney((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  hive.append = (items: HiveType[]) => hive.setHoney((prev) => [...prev, ...items]);
  hive.update = () => hive.setHoney((prev) => [...prev]);
  hive.updateByIndex = (index: number, newValue: HiveType) =>
    hive.setHoney((prev) => {
      prev[index] = newValue;
      return [...prev];
    });
  hive.updateById = (id: any, newValue: HiveType) => hive.setHoney((prev) => prev.map((item: any) => (item.id === id ? newValue : item)));

  return hive;
}
