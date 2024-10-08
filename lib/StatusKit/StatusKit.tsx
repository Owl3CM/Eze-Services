import React from "react";
import Loading from "./Loading";
import processing from "./Processing";
import loadingMore from "./LoadingMore";
import Empty from "./Empty";
import Error from "./Error";

export const StatusKit: IStatusKit = {
  processing,
  loading: Loading,
  error: Error as any,
  loadingMore,
  empty: Empty,
  reloading: Loading,
  searching: Loading,
  success: () => {
    return <p>nice</p>;
  },
  idle: null,
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
