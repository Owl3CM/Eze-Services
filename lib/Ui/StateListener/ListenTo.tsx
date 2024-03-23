import React from "react";
import { IStateManager } from "../../services/StateManager";

type StateManagerPropType =
  | {
      service: {
        stateManager: IStateManager;
      };
      stateManager?: any;
    }
  | {
      service?: any;
      stateManager: IStateManager;
    };

type Props = {
  className?: string;
  name?: string;
} & StateManagerPropType;

type ListenToProps = {
  children: (value: any, set: (newValue: any) => void) => JSX.Element;
  // children: ({ value, set }: { value: any; set: (newValue: any) => void }) => JSX.Element;
} & Props;

export const ListenTo = ({ service, stateManager = service.stateManager, name = "data", children }: ListenToProps) => {
  const [value, set] = stateManager.listenTo(name);
  // return children({ value, set });
  // return children({ [name]: value, set: set });
  return children(value, set);
};

type ListenToComponentProps = {
  Component: (props: { value: any; set: (newValue: any) => void }) => any;
} & Props;

export const ListenToComponent = ({ service, stateManager = service.stateManager, name = "data", Component }: ListenToComponentProps) => {
  const [value, set] = stateManager.listenTo(name);
  return <Component value={value} set={set} />;
};

type ListenToMultipleProps = {
  names: string[];
  Component: (props: { values: any; set: (newValues: any, replace?: boolean) => void }) => any;
} & StateManagerPropType;

export const ListenToMultipleComponent = ({ service, stateManager = service.stateManager, names = ["data"], Component }: ListenToMultipleProps) => {
  const values = stateManager.listenToMultiple(names);
  return <Component values={values} set={stateManager.set} />;
};
