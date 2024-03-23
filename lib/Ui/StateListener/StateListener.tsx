import React from "react";
import { Utils } from "../../utils";
import { useServiceState } from "./useServiceState";

interface Props {
  service: any;
  Component: (props: any) => any;
  className?: string;
  name?: string;
}

const StateListener = ({ service, Component, name = "data" }: Props) => {
  const [value, setValue] = useServiceState(service, name);
  return <Component {...{ [name]: value, set: setValue }} />;
};

export default StateListener;
