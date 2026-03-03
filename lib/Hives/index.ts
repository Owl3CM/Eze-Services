import { createHive } from "./Hive";
import { createHiveArray } from "./HiveArray";
import { createHiveObserver } from "./HiveObserver";
import { createProxyHive } from "./ProxyHive";
import { createFormHive } from "./FormHive";

const Hive = {
  state: createHive,
  list: createHiveArray,
  observer: createHiveObserver,
  proxy: createProxyHive,
  form: createFormHive,
};

export { Hive };
export * from "./Types";
