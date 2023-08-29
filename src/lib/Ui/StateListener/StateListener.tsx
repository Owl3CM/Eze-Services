import React from "react";
import { Utils } from "../../utils";

type IComponentProps = {
  state: any;
  setState: any;
};
interface Props {
  service: any;
  Component: (props: IComponentProps) => any;
  className?: string;
  name?: string;
  children?: React.ReactNode;
}

const StateListener = ({ service, Component, name = "data", children }: Props) => {
  const [setItems, onChange] = React.useMemo(() => {
    const upperName = Utils.capitalize(name);
    const _setItems = `set${upperName}`;
    const _onChange = `on${upperName}Changed`;
    return [_setItems, _onChange];
  }, []);

  [service[name], service[setItems]] = React.useState(service[name] ?? []);

  React.useEffect(() => {
    service[onChange]?.(service);
  }, [service[name]]);

  return <Component state={service[name]} setState={service[setItems]} />;
};

export default StateListener;

// const ReactStateBuilder = ({ service, Component, stateName = "data", children }: Props) => {
//   const setStateName = React.useMemo(() => Utils.convertToCamelCase(`set-${stateName}`), []);
//   [service[stateName], service[setStateName]] = React.useState(service[stateName] ?? null);

//   React.useEffect(() => {
//     service[Utils.convertToCamelCase(`on-${stateName}Changed`)]?.(service);
//   }, [service[stateName]]);

//   return <Component service={service} />;
// };

// export default ReactStateBuilder;
