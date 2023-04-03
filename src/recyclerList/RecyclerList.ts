import React from "react";

export interface IRecyclerProps {
  service: any;
  itemBuilder: React.ReactNode;
  className: string;
  children: React.ReactNode;
  stateKey?: string;
}
export declare const RecyclerList: React.FC<IRecyclerProps>;
export default RecyclerList;
