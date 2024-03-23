import React from "react";
import { useServiceState } from "../../Hooks";

interface StateListenerProps {
  service: any;
  name: string;
  children: (props: { value: any; setValue: (value: any) => void }) => React.ReactElement;
}

const StateListener = ({ service, name, children }: StateListenerProps) => {
  const [value, setValue] = useServiceState(service, name);

  return children({ value, setValue });
};

export default StateListener;
