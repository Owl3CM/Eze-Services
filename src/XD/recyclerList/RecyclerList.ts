import React from "react";
import { RecyclerList } from "./RecyclerListJs";

export interface IRecyclerProps {
  service: any;
  itemBuilder: React.ReactNode;
  className: string;
  children: React.ReactNode;
  stateKey?: string;
}

export default (props: IRecyclerProps) => <RecyclerList {...props} />;
