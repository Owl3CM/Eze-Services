import React from "react";
import loading from "./loading";
import processing from "./processing";
import loadingMore from "./loadingMore";
import noContent from "./noContent";
import error from "./error";

const StateKit: IStateKit = {
  processing,
  loading,
  error: error as any,
  loadingMore,
  noContent,
};

export const setDefaultStateKit = (kit: Partial<IStateKit>) => {
  Object.keys(kit).forEach((key) => {
    (StateKit as any)[key] = kit[key];
  });
};

export default StateKit;

type StateKitType = React.ReactNode | React.FC;
interface IStateKit {
  error: StateKitType;
  loading: StateKitType;
  processing: StateKitType;
  noContent: StateKitType;
  loadingMore: StateKitType;
  // success: StateKitType;
  // reloading: StateKitType;
  // searching: StateKitType;
  [key: string]: StateKitType;
}
