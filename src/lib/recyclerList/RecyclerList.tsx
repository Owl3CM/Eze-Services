import React, { ReactNode } from "react";
import RecyclerList_JS from "./RecyclerList_JS";
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

export default React.memo((props: IRecyclerProps) => <RecyclerList_JS {...props} />);
