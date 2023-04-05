declare module "./RecyclerListJs" {
  import React, { ReactNode } from "react";
  interface Props {
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

  export default class RecyclerListJs extends React.Component<Props> {}
}
