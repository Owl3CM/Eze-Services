import React from "react";
import loading from "./loading";
import processing from "./processing";
import loadingMore from "./loadingMore";
import empty from "./empty";
import error from "./error";

export const StatusKit: IStatusKit = {
  processing,
  loading,
  error: error as any,
  loadingMore,
  empty,
  reloading: loading,
  searching: loading,
  success: () => {
    return <p>nice</p>;
  },
};

export const setDefaultStatusKit = (kit: Partial<IStatusKit>) => {
  Object.keys(kit).forEach((key) => {
    (StatusKit as any)[key] = kit[key];
  });
};

type StatusKitType = React.ReactNode | React.FC;
interface IStatusKit {
  error: StatusKitType;
  loading: StatusKitType;
  processing: StatusKitType;
  empty: StatusKitType;
  loadingMore: StatusKitType;
  reloading: StatusKitType;
  searching: StatusKitType;
  success: StatusKitType;
  [key: string]: StatusKitType;
}
