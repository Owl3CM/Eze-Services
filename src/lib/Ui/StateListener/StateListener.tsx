import React from "react";
import { Utils } from "../../utils";

type IComponentProps = {
  // state: any;
  // setState: any;
};
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

  [service[name], service[setItems]] = React.useState(service[name] ?? []);

  React.useEffect(() => {
    service[onChange]?.(service);
  }, [service[name]]);

  return <Component {...{ [name]: service[name], [setItems]: service[setItems] }} />;
};

// how to make this work?
// when i use it like this

const service = {
  items: [],
  setItems: () => {},
};

type TESTTYPE = {
  items: [];
  setItems: () => {};
};

const TestUser = () => {
  return (
    <StateListener
      name="items"
      service={service}
      Component={({ items, setItems }: TESTTYPE) => {
        return items.map((item: any) => <p key={item.id}>{item.name}</p>);
      }}
    />
  );
};

export default StateListener;
