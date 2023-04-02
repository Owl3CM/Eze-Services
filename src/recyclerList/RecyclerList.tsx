import React from "react";
import RecyclerListJs from "./RecyclerListJs";

interface Props {
  service: any;
  itemBuilder: any;
  nodeBuilder: any;
  indecator: any;
  viewedItems: any;
  containerClass: any;
  gridClass: any;
  children: any;
}
export default (props: Props) => <RecyclerListJs {...props} />;
