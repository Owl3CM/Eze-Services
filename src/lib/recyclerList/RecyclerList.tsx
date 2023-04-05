import React, { ReactNode } from "react";
// import { RecyclerListJs } from "./RecyclerListJs";
const RecyclerListJs = require("./RecyclerListJs").default;

// const { service, itemBuilder, nodeBuilder, gridClass, containerClass, viewedItems, indecator, children } = props;
export interface IRecyclerProps {
  service: any;
  itemBuilder?: any;
  nodeBuilder?: ReactNode;
  gridClass?: string;
  containerClass?: string;
  viewedItems?: number;
  indecator?: ReactNode;
  stateKey?: string;
  children: ReactNode;
}

export default React.memo((props: IRecyclerProps) => <RecyclerListJs {...props} />);
