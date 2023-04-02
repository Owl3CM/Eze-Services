import React from "react";
import GridJs from "./GridJs";

export interface IGridProps {
  service: any;
  ItemBuilder: React.ReactNode;
  className: string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

export default (props: IGridProps) => <GridJs {...props} />;

// declare module "Grid" {
//   export interface IGridProps {
//     service: any;
//     onRefresh: (e: React.MouseEvent<HTMLDivElement>) => void;
//     useRefresh: boolean;
//     className: string;
//     children: React.ReactNode;
//     id: string;
//     refresher: React.ReactNode;
//     refresherProps: {
//       id: string;
//       reloadingClass: string;
//       disappearingClass: string;
//       pullingClass: string;
//       onPull: (e: React.MouseEvent<HTMLDivElement>) => void;
//     };
//   }
// }
