export { default as Utils } from "./Utils";

export * from "./TimedCallback";

export const ExtractId = (obj: any, key: string) => {
  if (typeof obj[key] === "object") obj[key] = obj[key].id;
};

export const ExtractIds = (obj: any, keys: string[]) => {
  keys.forEach((key) => ExtractId(obj, key));
};

export const ExtractValue = (obj: any, key: string) => {
  const value = obj[key];
  delete obj[key];
  return value;
};

export const ExtractValues = (obj: any, keys: string[]) => {
  return keys.map((key) => ExtractValue(obj, key));
};

/** Shallow-compare two record objects by keys and values. */
export function shallowEqual(a: Record<string, any> | undefined, b: Record<string, any> | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((k) => a[k] === b[k]);
}
