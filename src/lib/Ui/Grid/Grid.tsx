import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  itemBuilder?: any;
  className?: string;
  stateKey?: string;
  children?: React.ReactNode;
}

const Grid = ({ service, itemBuilder: Builder, className = "local-grid", stateKey = "data", children, ...props }: Props) => {
  const itemsKey = React.useMemo(() => Utils.convertToCamelCase(`set-${stateKey}`), []);
  [service[stateKey], service[itemsKey]] = React.useState(service[stateKey] ?? []);
  service[itemsKey.slice(-1)] = React.useMemo(() => (item: any) => service[itemsKey]((items: any) => items.map((i: any) => (i.id === item.id ? item : i))), []);

  React.useEffect(() => {
    service[`${stateKey}Changed`]?.(service);
  }, [service[stateKey]]);

  return (
    <div id="grid-container" className={className} {...props}>
      {children}
      {!Array.isArray(service[stateKey])
        ? service[stateKey].map((item: any, i: number) => <Builder key={i} item={item} />)
        : Object.entries(service[stateKey]).map(([key, item]) => <Builder key={key} item={item} />)}
    </div>
  );
};

export default Grid;
