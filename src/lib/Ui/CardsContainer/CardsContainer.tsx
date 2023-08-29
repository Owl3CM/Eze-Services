import React from "react";
import { Utils } from "../../utils";

interface Props {
  service: any;
  itemBuilder?: any;
  className?: string;
  stateName?: string;
  children?: React.ReactNode;
}

const CardsContainer = ({ service, itemBuilder: Builder, className = "local-grid", stateName = "data", children, ...props }: Props) => {
  const [setItems, onChange] = React.useMemo(() => {
    const upperName = Utils.capitalize(stateName);
    const _setItems = `set${upperName}`;
    const _setItem = _setItems.slice(0, -1);
    const _onChange = `on${upperName}Changed`;

    service[_setItem] = (item: any) => service[_setItems]((items: any) => items.map((i: any) => (i.id === item.id ? item : i)));
    return [_setItems, _onChange];
  }, []);

  [service[stateName], service[setItems]] = React.useState(service[stateName] ?? []);

  React.useEffect(() => {
    service[onChange]?.(service);
  }, [service[stateName]]);

  return (
    <div id="cards-container" className={className} {...props}>
      {children}
      {!Array.isArray(service[stateName])
        ? service[stateName].map((item: any, i: number) => <Builder key={i} item={item} />)
        : Object.entries(service[stateName]).map(([key, item]) => <Builder key={key} item={item} />)}
    </div>
  );
};

export default CardsContainer;
