import { createHive } from "./Hive";
import { IHive, IProxyHive, IStoreKey } from "./Types";

export function createProxyHive<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IProxyHive<HiveType> {
  type ProxyHiveKey = keyof HiveType;
  const proxyHive = createHive(initialValue, storeKey) as IProxyHive<HiveType>;
  const _NestedHives = new Map<ProxyHiveKey, IHive<any>>();

  proxyHive.createNestedHive = <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => {
    const nestedHive = createHive(initialValue, storeKey) as IHive<NestedHiveType>;
    nestedHive.subscribe((newValue: any) => {
      proxyHive.silentSetHoney({ ...proxyHive.honey, [key]: newValue });
    });
    proxyHive.subscribe((newValue: any) => {
      if (newValue[key] === nestedHive.honey) return;
      nestedHive.setHoney(newValue[key]);
    });
    _NestedHives.set(key as any, nestedHive);
    proxyHive.setHoney((prev) => ({ ...prev, [key]: initialValue }));
    return nestedHive;
  };

  proxyHive.setNestedHoney = (key: ProxyHiveKey, value: any, effect?: boolean) => {
    if (typeof value === "function") value = value(proxyHive.honey[key]);
    if (effect) proxyHive.setHoney((prev) => ({ ...prev, [key]: value }));
    else _NestedHives.get(key)?.setHoney(value);
  };

  proxyHive.getNestedHoney = (key: ProxyHiveKey) => _NestedHives.get(key)!.honey;

  // proxyHive.getNestedHive = (key: ProxyHiveKey) => _NestedHives.get(key) as IHive<(typeof initialValue)[key]>;
  proxyHive.subscribeToNestedHive = (key: ProxyHiveKey, callback: (value: any) => void) => {
    _NestedHives.get(key)?.subscribe(callback);
  };

  proxyHive.reset = () => {
    proxyHive.setHoney(initialValue);
  };
  // Create nested hives from initial value
  Object.entries(initialValue as any).forEach(([key, val]) => {
    proxyHive.createNestedHive(key, val);
  });
  return proxyHive;
}
