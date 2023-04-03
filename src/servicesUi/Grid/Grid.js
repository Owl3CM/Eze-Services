import React from "react";
const convertToCamelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const Grid = ({ service, itemBuilder: Builder, className = "local-grid", stateKey = "items", children, ...props }) => {
  const itemsKey = convertToCamelCase(`set-${stateKey}`);
  [service[stateKey], service[itemsKey]] = React.useState(service[stateKey] ?? []);
  service[itemsKey.slice(-1)] = React.useMemo(() => (item) => service[itemsKey]((items) => items.map((i) => (i.id === item.id ? item : i))), []);

  return (
    <div id="grid-container" className={className} {...props}>
      {service[stateKey].map((item, i) => (
        <Builder key={i} item={item} />
      ))}
      {children}
    </div>
  );
};
export default Grid;
