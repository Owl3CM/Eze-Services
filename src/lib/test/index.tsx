import React from "react";
export interface IRecyclerProps {
  service?: any;
  itemBuilder?: any;
  nodeBuilder?: React.ReactNode;
  gridClass?: string;
  containerClass?: string;
  viewedItems?: number;
  indecator?: React.ReactNode;
  stateKey?: string;
  children?: React.ReactNode;
}

export declare const RecyclerListJs: React.FC<IRecyclerProps>;
// export const RecyclerListJs: React.FC<IRecyclerProps>;
export default RecyclerListJs;

// export { default as RecyclerListJs } from "./RecyclerListJs";
