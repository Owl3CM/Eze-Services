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
