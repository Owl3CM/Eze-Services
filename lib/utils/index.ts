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
