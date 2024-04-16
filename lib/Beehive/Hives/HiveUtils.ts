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
