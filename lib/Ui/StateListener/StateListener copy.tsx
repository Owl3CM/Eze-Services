import React from "react";
import { Utils } from "../../utils";
import { create } from "zustand";

interface Props {
  service: any;
  Component: (props: any) => any;
  className?: string;
  name?: string;
}

const useStore = create((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, inc } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={inc}>one up</button>
    </div>
  );
}

const StateListener = ({ service, Component, name = "data" }: Props) => {
  const useStore = create((set) => ({
    [name]: service[name], // Assuming service[name] is already defined
    [`update${Utils.capitalize(name)}`]: (newValue) => set((state) => ({ [name]: newValue })),
  }));
  const stateValue = useStore((state) => state[name]);
  const updateStateValue = useStore((state) => state[`update${Utils.capitalize(name)}`]);

  return <Component {...{ [name]: stateValue, updateStateValue }} />;
};

// const StateListener = ({ service, Component, name = "data" }: Props) => {
//   const [setItems, onChange] = React.useMemo(() => {
//     const upperName = Utils.capitalize(name);
//     const _setItems = `set${upperName}`;
//     const _onChange = `on${upperName}Changed`;
//     return [_setItems, _onChange];
//   }, []);

//   [service[name], service[setItems]] = React.useState(service[name]);

//   React.useEffect(() => {
//     service[onChange]?.(service[name]);
//   }, [service[name]]);

//   return <Component {...{ [name]: service[name], [setItems]: service[setItems] }} />;
// };

export default StateListener;
