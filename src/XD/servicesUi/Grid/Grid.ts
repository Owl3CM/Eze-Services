import React from "react";
export interface IGridProps {
  service: any;
  itemBuilder: React.ReactNode;
  className: string;
  children: React.ReactNode;
  stateKey?: string;
}
export declare const Grid: React.FC<IGridProps>;
export default Grid;
