export { default as Utils } from "./Utils";

export const ExtractId = (obj: any, key: string) => {
  if (typeof obj[key] === "object") {
    obj[key] = obj[key].id;
  }
};
export const ExtractIds = (obj: any, keys: string[]) => {
  keys.forEach((key) => {
    ExtractId(obj, key);
  });
};
