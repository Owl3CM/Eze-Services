import React from "react";
import loading from "./loading";
import processing from "./processing";
import loadingMore from "./loadingMore";
import empty from "./empty";
import error from "./error";

const StatusKit: IStatusKit = {
  processing,
  loading,
  error: error as any,
  loadingMore,
  empty,
  reloading: loading,
  searching: loading,
};

export const setDefaultStatusKit = (kit: Partial<IStatusKit>) => {
  Object.keys(kit).forEach((key) => {
    (StatusKit as any)[key] = kit[key];
  });
};

export default StatusKit;

type StatusKitType = React.ReactNode | React.FC;
interface IStatusKit {
  error: StatusKitType;
  loading: StatusKitType;
  processing: StatusKitType;
  empty: StatusKitType;
  loadingMore: StatusKitType;
  // success: StatusKitType;
  // reloading: StatusKitType;
  // searching: StatusKitType;
  [key: string]: StatusKitType;
}
