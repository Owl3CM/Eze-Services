import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  Component?: React.ComponentType<any>;
  className?: string;
  stateKey?: string;
  children?: React.ReactNode;
}

const ReactStateBuilder = ({ service, Component, stateKey = "data", children }: Props) => {
  const dataKey = React.useMemo(() => Utils.convertToCamelCase(`set-${stateKey}`), []);
  [service[stateKey], service[dataKey]] = React.useState(service[stateKey] ?? []);

  React.useEffect(() => {
    service[`${stateKey}Changed`]?.(service);
  }, [service[stateKey]]);

  return Component && service[stateKey] ? (
    <>
      <Component />
      {children}
    </>
  ) : null;
};

export default ReactStateBuilder;
