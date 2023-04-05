import React, { ReactNode } from "react";
import RecyclerList from "./RecyclerList";
export interface IRecyclerProps {
  service?: any;
  itemBuilder?: any;
  nodeBuilder?: ReactNode;
  gridClass?: string;
  containerClass?: string;
  viewedItems?: number;
  indecator?: ReactNode;
  stateKey?: string;
  children?: ReactNode;
}

export default React.memo((props: IRecyclerProps) => <RecyclerList {...props} />);
