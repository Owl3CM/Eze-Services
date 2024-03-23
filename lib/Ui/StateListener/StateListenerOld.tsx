import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  Component: (props: any) => any;
  className?: string;
  name?: string;
}

const StateListenerOld = ({ service, Component, name = "data" }: Props) => {
  const t = () => {
    const upperName = Utils.capitalize(name);
    const _setItems = `set${upperName}`;
    const _onChange = `on${upperName}Changed`;
    return [_setItems, _onChange];
  };
  const [setItems, onChange] = t();

  [service[name], service[setItems]] = React.useState(service[name]);

  React.useEffect(() => {
    service[onChange]?.(service[name]);
  }, [service[name]]);

  return <Component {...{ [name]: service[name], [setItems]: service[setItems] }} />;
};

export default StateListenerOld;
