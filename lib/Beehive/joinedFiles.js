///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/ArrayBee.tsx 
ArrayBee.tsx
import React from "react";
import { useHoney } from "../Hooks";
import { ArrayBeeProps } from "./Types";

export default function ArrayBee<HiveType = any>({ hive, Component }: ArrayBeeProps<HiveType>) {
  return useHoney(hive).map((item: any, i: number) => <Component key={item.id} honey={item} i={i} />);
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/Bee.tsx 
Bee.tsx
import React from "react";
import { BeeProps } from "./Types";
import { useHoney } from "../Hooks";

export default function Bee<HiveType = any>({ hive, Component }: BeeProps<HiveType>) {
  return <Component honey={useHoney(hive)} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/Bees.tsx 
Bees.tsx
import React from "react";
import { useHoney } from "../Hooks";
import { BeesProps } from "./Types";

export default function Bees({ hiveCluster, Component }: BeesProps) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive);
  });
  const set = (newValues: { [key: keyof typeof hiveCluster]: any }, replace = false) => {
    if (replace) Object.entries(hiveCluster).forEach(([key, hive]) => hive.setHoney(newValues[key]));
    else Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].setHoney(value));
  };
  return <Component cell={cell} set={set} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/FormBee.tsx 
FormBee.tsx
import React from "react";
import { FormBeeProps } from "./Types";
import { useHoney } from "../Hooks";

export default function FormBee<HiveType = any>({ hive, Component }: FormBeeProps<HiveType>) {
  const { value, error } = useHoney(hive);
  return <Component honey={value} error={error} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} validate={hive.validate} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/FormBees.tsx 
FormBees.tsx
import React from "react";
import { FormBeesProps } from "./Types";
import { useHoney } from "../Hooks";

export default function FormBees<HiveType = any>({ hiveCluster, Component }: FormBeesProps<HiveType>) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    const { value, error } = (useHoney as any)(hive);
    cell[key] = { value, error };
  });
  const set = (newValues: { [key: keyof typeof hiveCluster]: any }, replace = false) => {
    if (replace) Object.entries(hiveCluster).forEach(([key, hive]: any) => hive.setHoney(newValues[key]));
    else Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].setHoney(value));
  };
  const validate = (newValues: { [key: keyof typeof hiveCluster]: any }) => {
    Object.entries(newValues).forEach(([key, value]) => hiveCluster[key].validate(value));
  };

  return <Component cell={cell} set={set} validate={validate as any} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/ObserverBee.tsx 
ObserverBee.tsx
import React from "react";
import { useHoney } from "../Hooks";
import { ObserverBeeProps } from "./Types";

export default function ObserverBee<HiveType = any>({ hive, Component }: ObserverBeeProps<HiveType>) {
  return <Component honey={useHoney(hive)} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/ObserverBees.tsx 
ObserverBees.tsx
import React from "react";
import { useHoney } from "../Hooks";
import { ObserverBeesProps } from "./Types";

export default function ObserverBees({ hiveCluster, Component }: ObserverBeesProps) {
  const cell = {} as { [key: keyof typeof hiveCluster]: any };
  Object.entries(hiveCluster).map(([key, hive]) => {
    cell[key] = (useHoney as any)(hive);
  });
  return <Component cell={cell} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/ProxyBee.tsx 
ProxyBee.tsx
import React from "react";
import { useHoney } from "../Hooks";

export default function ProxyBee<HiveType>({ hive, Component }: any) {
  return <Component honey={useHoney(hive)} setHoney={hive.setHoney} silentSetHoney={hive.silentSetHoney} />;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/Types.ts 
Types.ts
import { IHive, IHiveArray, IHiveObserver, INestedFormHive, IProxyHive } from "../Hives/Types";

export type KeyValueHive = { [key: string]: IHive<any> | IHiveArray<any> };
export type KeyValueNestedFormHive = { [key: string]: INestedFormHive<any> };
export type KeyValueHiveObserver = { [key: string]: IHiveObserver<any> | IHive<any> | INestedFormHive<any> | IHiveArray<any> };

export type HoneySetter<HiveType> = (prev: HiveType) => void | HiveType;

export type BeeProps<HiveType> = {
  hive: IHive<HiveType>;
  Component: (props: { honey: HiveType; setHoney: HoneySetter<HiveType>; silentSetHoney: HoneySetter<HiveType> }) => any;
};

export type BeesProps = {
  hiveCluster: KeyValueHive;
  Component: (props: { cell: KeyValueHive; set: (newValues: KeyValueHive, replace?: boolean) => void }) => any;
};

export type ArrayBeeProps<HiveType> = {
  hive: IHiveArray<HiveType>;
  Component: (props: { honey: HiveType; i: number }) => any;
};

export type ObserverBeeProps<HiveType> = {
  hive: IHiveObserver<HiveType> | IHive<HiveType>;
  Component: (props: { honey: HiveType }) => any;
};

export type ObserverBeesProps = {
  hiveCluster: KeyValueHiveObserver;
  Component: (props: { cell: KeyValueHiveObserver }) => any;
};

export type INestedFormHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);

export type FormBeeProps<HiveType> = {
  hive: INestedFormHive<HiveType>;
  Component: (props: {
    honey: HiveType;
    setHoney: HoneySetter<HiveType>;
    silentSetHoney: HoneySetter<HiveType>;
    error?: string;
    validate: INestedFormHoneySetter<HiveType>;
  }) => any;
};
export type FormBeesProps<HiveType> = {
  hiveCluster: KeyValueNestedFormHive;
  Component: (props: {
    cell: KeyValueNestedFormHive;
    set: (newValues: KeyValueNestedFormHive, replace?: boolean) => void;
    error?: string;
    validate: INestedFormHoneySetter<HiveType>;
  }) => any;
};

export type ProxyHoneySetter<K> = (prev: K, effect?: boolean) => void | ((hive: K, effect?: boolean) => void);

// export interface IProxyHive<HiveType> extends IHive<HiveType> {
//   createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => IHive<NestedHiveType>;
//   getNestedHive: <K extends keyof HiveType>(key: K) => IHive<HiveType[K]> | undefined;
//   setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
//   getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
//   subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
//   reset: () => void;
// }
// export type ProxyBeeProps<HiveType> = {
//   id: keyof HiveType;
//   hive: IProxyHive<HiveType>;
//   Component: (props: valueof IProxyHive<HiveType>.get) => any;
// };


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Bees/index.ts 
index.ts
export { default as Bee } from "./Bee";
export { default as Bees } from "./Bees";
export { default as ArrayBee } from "./ArrayBee";
export { default as ObserverBee } from "./ObserverBee";
export { default as ObserverBees } from "./ObserverBees";
export { default as FormBee } from "./FormBee";
export { default as FormBees } from "./FormBees";
export { default as ProxyBee } from "./ProxyBee";
export * as Types from "./Types";


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/AsyncHive.ts 
AsyncHive.ts
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


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/FormHive.ts 
FormHive.ts
import { Toast } from "eze-utils";
import { createHive } from "./Hive";
import { _getHiveBase } from "./HiveBase";
import { CheckSimilarity } from "./HiveUtils";
import { IFormHive, INestedFormHive, IStoreKey } from "./Types";

export function createFormHive<HiveType>({
  initialValue,
  storeKey,
  validator,
  validateMode = "onBlur",
  onSubmit,
}: {
  initialValue: HiveType;
  storeKey?: IStoreKey;
  validator?: (key: keyof HiveType, value: any) => string;
  validateMode?: "onBlur" | "onChange" | "onSubmit";
  onSubmit: (honey: HiveType) => void;
}): IFormHive<HiveType> {
  type FormHiveKey = keyof HiveType;
  const formHive = createHive(initialValue, storeKey) as IFormHive<HiveType>;
  const _NestedHives = new Map<FormHiveKey, INestedFormHive<any>>();

  formHive.createNestedHive = <NestedHiveType>(key: string, nestedIniVal: NestedHiveType, storeKey?: string) => {
    const [nestedHive, pollinate] = _getHiveBase({ value: nestedIniVal, error: null }, storeKey) as any as [INestedFormHive<NestedHiveType>, () => void];
    formHive.silentSetHoney = (newValue: any) => {
      formHive.honey = typeof newValue === "function" ? newValue(formHive.honey) : newValue;
      formHive.isDirtyHive.setHoney(!CheckSimilarity(formHive.honey, initialValue));
      formHive.isValidHive.setHoney(Object.keys(formHive.errors).length === 0);
    };

    _NestedHives.set(key as any, nestedHive);
    formHive.errors = {};
    formHive.getError = (key: keyof HiveType) => formHive.errors[key as string];
    formHive.setError = (key: keyof HiveType, err?: string) => formHive.getNestedHive(key).setError(err);
    formHive.clearErrors = () => {
      _NestedHives.forEach((nh) => {
        nh.setError();
      });
    };

    nestedHive.silentSetHoney = (value: any) => {
      if (typeof value === "function") value = value(nestedHive.honey.value);
      nestedHive.honey = {
        value,
        error: nestedHive.honey.error,
      };
    };

    nestedHive.setError = (error?: string) => {
      if (!error) error = undefined;
      if (formHive.errors[key as string] === error) return;
      formHive.errors[key as string] = error as any;
      nestedHive.honey = {
        value: nestedHive.honey.value,
        error,
      };
      if (nestedHive._subscribers() < 2) Toast.error({ title: error });
      pollinate();
    };

    nestedHive.validate = validator
      ? (value: NestedHiveType, effect?: boolean) => {
          // console.log("validate", key, value, effect);

          if (typeof value === "function") value = value(nestedHive.honey.value);
          if (nestedHive.honey.error) nestedHive.setError(validator(key as FormHiveKey, value));
          else if (validateMode !== "onSubmit")
            if (validateMode === "onChange") nestedHive.setError(validator(key as FormHiveKey, value));
            else if (validateMode === "onBlur") {
              const focusedElement = document.querySelector(":focus") as HTMLElement & { willValidateOnBlur?: boolean };
              if (focusedElement && !focusedElement.willValidateOnBlur) {
                focusedElement.willValidateOnBlur = true;
                focusedElement.addEventListener(
                  "blur",
                  () => {
                    setTimeout(() => {
                      nestedHive.setError(validator(key as FormHiveKey, nestedHive.honey.value));
                      focusedElement.willValidateOnBlur = false;
                    }, 10);
                  },
                  { once: true }
                );
              }
            }
          if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
          else nestedHive.setHoney(value);
        }
      : nestedHive.setHoney;

    nestedHive.isValid = validator
      ? () => {
          nestedHive.setError(validator(key as FormHiveKey, nestedHive.honey.value));
          return !nestedHive.honey.error;
        }
      : () => true;

    nestedHive.subscribe((newValue: any) => {
      formHive.silentSetHoney({ ...formHive.honey, [key]: newValue.value });
    });
    formHive.subscribe((newValue: any) => {
      if (newValue[key] === nestedHive.honey.value) return;
      nestedHive.setHoney(newValue[key]);
    });

    if ((formHive as any).honey[key] !== nestedIniVal) {
      formHive.setHoney((prev) => ({ ...prev, [key]: nestedIniVal }));
      initialValue = { ...initialValue, [key]: nestedIniVal };
    }

    return nestedHive;
  };

  formHive.setNestedHoney = (key: FormHiveKey, value: any, effect?: boolean) => {
    if (typeof value === "function") value = value(formHive.honey[key]);
    if (effect) formHive.setHoney((prev) => ({ ...prev, [key]: value }));
    else _NestedHives.get(key)?.setHoney(value);
  };
  formHive.getNestedHoney = (key: FormHiveKey) => _NestedHives.get(key)!.honey.value;
  formHive.getNestedHive = (key: FormHiveKey) => _NestedHives.get(key) as any;
  formHive.subscribeToNestedHive = (key: FormHiveKey, callback: (value: any) => void) => {
    _NestedHives.get(key)?.subscribe(callback);
  };
  formHive.validate = (key: keyof HiveType, value: any, effect?: boolean) => {
    formHive.getNestedHive(key).validate(value, effect);
  };

  // Create nested hives from initial value
  Object.entries(initialValue as any).forEach(([key, val]) => {
    formHive.createNestedHive(key, val);
  });

  formHive.reValidate = (validateKeys?: FormHiveKey[]) =>
    new Promise<boolean>((resolve) => {
      formHive.clearErrors();
      if (!validateKeys) validateKeys = Object.keys(initialValue as any) as FormHiveKey[];

      setTimeout(() => {
        let isValid = true;
        if (!validator) return resolve(isValid);

        _NestedHives.forEach((nh, key) => {
          if (!validateKeys!.includes(key)) return;
          nh.setError((validator as any)(key as FormHiveKey, nh.honey.value));
          if (isValid && !nh.isValid()) isValid = false;
        });
        resolve(isValid);
      }, 100);
    });

  formHive.submit = (e, validateKeys?: FormHiveKey[]) => {
    e?.preventDefault();
    formHive.reValidate(validateKeys).then((isValid) => {
      if (isValid) onSubmit(formHive.honey);
    });
  };

  formHive.isDirtyHive = createHive(false);
  formHive.isValidHive = createHive(true);
  return formHive;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/Hive.ts 
Hive.ts
import { _getHiveBase } from "./HiveBase";
import { IHive, IStoreKey } from "./Types";

export function createHive<HiveType = any>(initialValue: HiveType, storeKey?: IStoreKey): IHive<HiveType> {
  return _getHiveBase(initialValue, storeKey)[0];
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/HiveArray.ts 
HiveArray.ts
import { createHive } from "./Hive";
import { IHiveArray, IStoreKey } from "./Types";

export function createHiveArray<HiveType>(initialValue: HiveType[], storeKey?: IStoreKey): IHiveArray<HiveType> {
  const hive = createHive(initialValue, storeKey) as any as IHiveArray<HiveType>;

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


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/HiveBase.ts 
HiveBase.ts
import { StorageType } from "../../Utils/Storable";
import { CheckSimilarity, getStorable } from "./HiveUtils";
import { IHive, IHiveBase, IStoreKey } from "./Types";

export function _getHiveBase<HiveType>(initialValue: HiveType, storeKey?: IStoreKey): IHiveBase<HiveType> {
  const subscribers = new Set<(newValue: HiveType) => void>();

  const pollinate = async () => {
    subscribers.forEach((callback) => callback(baseHive.honey));
  };

  let silentSetHoney = (newValue: any) => {
    baseHive.honey = typeof newValue === "function" ? newValue(baseHive.honey) : newValue;
  };

  const setHoney = (newValue: any) => {
    if (newValue === baseHive.honey) return;
    // if (CheckSimilarity(newValue, baseHive.honey)) return;
    baseHive.silentSetHoney(newValue);
    pollinate();
  };

  const baseHive: IHive<HiveType> = {
    initialValue,
    honey: initialValue,
    setHoney,
    silentSetHoney,
    subscribe: (callback) => {
      if (baseHive.honey !== initialValue) callback(baseHive.honey);
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    _subscribers: () => subscribers.size,
    reset: () => baseHive.setHoney(initialValue),
  };

  if (storeKey) {
    let storage = "memoryStorage" as StorageType;
    if (typeof storeKey === "object") {
      storage = storeKey.storage;
      storeKey = storeKey.storeKey;
    }
    const Storable = getStorable(storage);

    const storedValue = Storable.get(storeKey);
    if (storedValue) baseHive.setHoney(storedValue);

    baseHive.subscribe((newValue: any) => Storable.set(storeKey, newValue));
    baseHive.clearStore = () => {
      baseHive.setHoney(initialValue);
      Storable.clear(storeKey);
    };
  } else pollinate();

  return [baseHive, pollinate];
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/HiveObserver.ts 
HiveObserver.ts
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


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/HiveUtils.ts 
HiveUtils.ts
import Storable, { StorageType } from "../../Utils/Storable";

const _Storables = {
  localStorage: null,
  sessionStorage: null,
  memoryStorage: null,
} as any;

export const getStorable = (storage: StorageType = "memoryStorage") => {
  if (_Storables[storage as string] === null) _Storables[storage as string] = new Storable({ storeKey: "BeehiveStore_", storage });
  return _Storables[storage as string];
};

export const CheckSimilarity = (a: any, b: any) => {
  if (typeof a !== typeof b) return false;
  if (typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!CheckSimilarity(a[i], b[i])) return false;
      }
    } else {
      if (a === null || b === null) return a === b;
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      for (let i = 0; i < aKeys.length; i++) {
        if (!CheckSimilarity(a[aKeys[i]], b[bKeys[i]])) return false;
      }
    }
  } else if (a !== b) return false;
  return true;
};


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/ProxyHive.ts 
ProxyHive.ts
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


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/Types.ts 
Types.ts
import { StorageType } from "../../Utils/Storable";

export interface IHive<HiveType> {
  honey: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  reset: () => void;
  clearStore?: () => void;
  initialValue: HiveType;
}

export type HiveGetter<HiveType> = (get: <Target>(a: IHive<Target>) => Target) => HiveType;
export type IHiveBase<HiveType> = [IHive<HiveType>, () => void];

export interface IHiveObserver<HiveType> {
  honey: any;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  setHoney?: undefined;
  silentSetHoney?: undefined;
}

export interface IHiveArray<HiveType> {
  honey: HiveType[];
  setHoney: (newValue: HiveType[] | ((prev: HiveType[]) => HiveType[])) => void;
  silentSetHoney: (newValue: HiveType[]) => void;
  subscribe: (callback: (newValue: HiveType[]) => void) => () => void;
  _subscribers: () => number;
  push: (newValue: HiveType) => void;
  pop: () => void;
  shift: () => void;
  unshift: (newValue: HiveType) => void;
  splice: (start: number, deleteCount: number, ...items: HiveType[]) => void;
  remove: (id: any) => void;
  removeById: (id: any) => void;
  removeByIndex: (index: number) => void;
  append: (items: HiveType[]) => void;
  update: () => void;
  updateById: (id: any, newValue: HiveType) => void;
  updateByIndex: (index: number, newValue: HiveType) => void;
}

export interface IProxyHive<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => IHive<NestedHiveType>;
  getNestedHive: <K extends keyof HiveType>(key: K) => IHive<HiveType[K]> | undefined;
  setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  reset: () => void;
}

export interface IFormHive<HiveType> extends IHive<HiveType> {
  createNestedHive: <NestedHiveType>(key: string, initialValue: NestedHiveType, storeKey?: string) => INestedFormHive<NestedHiveType>;
  getNestedHive: <K extends keyof HiveType>(key: K) => INestedFormHive<HiveType[K]>;
  setNestedHoney: <K extends keyof HiveType>(key: K, value: HiveType[K] | ((prev: HiveType[K]) => HiveType[K]), effect?: boolean) => void;
  getNestedHoney: <K extends keyof HiveType>(key: K) => HiveType[K];
  subscribeToNestedHive: <K extends keyof HiveType>(key: K, callback: (value: HiveType[K]) => void) => void;
  validate: (key: keyof HiveType, value: HiveType[keyof HiveType], effect?: boolean) => void;
  errors: { [key: string]: string };
  getError: (key: keyof HiveType) => string;
  setError: (key: keyof HiveType, value: string) => void;
  clearErrors: () => void;
  isDirtyHive: IHive<boolean>;
  isValidHive: IHive<boolean>;
  reValidate: <K extends keyof HiveType>(validateKeys?: K[]) => Promise<boolean>;
  submit: <K extends keyof HiveType>(e?: React.FormEvent<HTMLFormElement>, validateKeys?: K[]) => void;
}

export interface INestedFormHive<HiveType> {
  // honey: HiveType;
  initialValue: HiveType;
  setHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  silentSetHoney: (newValue: HiveType | ((prev: HiveType) => HiveType)) => void;
  subscribe: (callback: (newValue: HiveType) => void) => () => void;
  _subscribers: () => number;
  clearStore?: () => void;

  honey: {
    value: HiveType;
    error?: string;
  };

  error?: string;
  setError: (err?: string) => void;
  validate: (honey: HiveType, effect?: boolean) => void;
  isValid: () => boolean;
  reset: () => void;
}

export type IStoreKey = string | { storeKey: string; storage: StorageType };


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hives/index.ts 
index.ts
export { createHive } from "./Hive";
export { createHiveArray } from "./HiveArray";
export { createHiveObserver } from "./HiveObserver";
export { createProxyHive } from "./ProxyHive";
export { createFormHive } from "./FormHive";
export * as Types from "./Types";


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hooks/index.ts 
index.ts
export { default as useHoney } from "./useHoney";
export { default as useHive } from "./useHive";


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hooks/useHive.ts 
useHive.ts
import { IHive } from "../Hives/Types";
import useHoney from "./useHoney";

export default function useHive<HiveType>(hive: IHive<HiveType>) {
  return [useHoney(hive), hive.setHoney];
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/Hooks/useHoney.ts 
useHoney.ts
import { useEffect, useState } from "react";
import { IHive, IHiveArray, IHiveObserver, INestedFormHive } from "../Hives/Types";

export default function useHoney<HiveType>(hive: IHive<HiveType> | IHiveObserver<HiveType> | IHiveArray<HiveType> | INestedFormHive<HiveType>) {
  const [, storeHoneyValue] = useState(hive.honey);
  useEffect(() => hive.subscribe(storeHoneyValue), [hive]);
  return hive.honey;
}


///Users/hyder/Owl/Eze-packages/Eze-Services/lib/Beehive/index.ts 
index.ts
export * from "./Bees/Types";
export * from "./Hives/Types";
export { createHive, createHiveArray, createHiveObserver, createProxyHive, createFormHive } from "./Hives";
export { Bee, Bees, ArrayBee, ObserverBee, ObserverBees, FormBee, FormBees, ProxyBee } from "./Bees";
export { useHive, useHoney } from "./Hooks";


