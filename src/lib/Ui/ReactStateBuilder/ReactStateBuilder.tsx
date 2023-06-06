import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  Component?: React.ComponentType<any>;
  className?: string;
  stateName?: string;
  children?: React.ReactNode;
}

const ReactStateBuilder = ({ service, Component, stateName = "data", children }: Props) => {
  const dataKey = React.useMemo(() => Utils.convertToCamelCase(`set-${stateName}`), []);
  [service[stateName], service[dataKey]] = React.useState(service[stateName] ?? []);

  React.useEffect(() => {
    service[Utils.convertToCamelCase(`on-${stateName}Changed`)]?.(service);
  }, [service[stateName]]);

  return Component && service[stateName] ? <Component service={service} /> : null;
};

export default ReactStateBuilder;
