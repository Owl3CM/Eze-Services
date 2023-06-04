import React from "react";
import StateKit from "./StateKit";
import { ServiceState, State } from "../Types";
import { createPortal } from "react-dom";
import { IStateBuilder } from "./StateBuilder";

// const States = {};

interface IStateBuilderProps<S> {
  service: IStateBuilder<S>;
  defaultState?: ServiceState<S>;
  // singleState?: boolean;
  getBuilder?: (state: ServiceState<S>) => any;
  idle?: any;
  loading?: any;
  processing?: any;
  reloading?: any;
  searching?: any;
  error?: any;
  noContent?: any;
  loadingMore?: any;
  [key: string]: any;
}

function ServiceStateBuilder<S = State>({ service, defaultState = service.state, singleState = false, getBuilder, ...args }: IStateBuilderProps<S>) {
  [service.state, service.setState] = React.useState(defaultState);
  const _getBuilder = React.useMemo(() => {
    return (
      getBuilder ??
      ((state: any) => {
        if (typeof state === "string") return { Builder: { ...StateKit, ...service?.stateKit, ...args }[state], props: { service } };
        else if (typeof state === "object" && state.state)
          return { Builder: { ...StateKit, ...service?.stateKit, ...args }[state.state], props: state.props, parent: state.parent };
        return {};
      })
    );
  }, [getBuilder]);

  return React.useMemo(() => {
    let { Builder, parent, props } = _getBuilder(service.state);
    if (!Builder) return null;
    return parent ? createPortal(<Builder {...props} />, parent) : <Builder {...props} />;
  }, [service.state]);
}
export default ServiceStateBuilder;
function identity<Type>(arg: Type): Type {
  return arg;
}
