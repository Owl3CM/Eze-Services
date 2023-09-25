import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  Component: (props: any) => any;
  className?: string;
  name?: string;
}

const StateListener = ({ service, Component, name = "data" }: Props) => {
  const [setItems, onChange] = React.useMemo(() => {
    const upperName = Utils.capitalize(name);
    const _setItems = `set${upperName}`;
    const _onChange = `on${upperName}Changed`;
    return [_setItems, _onChange];
  }, []);

  [service[name], service[setItems]] = React.useState(service[name]);

  React.useEffect(() => {
    service[onChange]?.(service);
  }, [service[name]]);

  return <Component {...{ [name]: service[name], [setItems]: service[setItems] }} />;
};

export default StateListener;
