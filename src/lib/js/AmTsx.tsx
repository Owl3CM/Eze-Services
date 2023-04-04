import React from "react";
import AmJsx from "./AmJsx";

interface Props {
  somePro?: string;
  somePropp?: string;
}

export default (props: Props) => <AmJsx {...props} />;
