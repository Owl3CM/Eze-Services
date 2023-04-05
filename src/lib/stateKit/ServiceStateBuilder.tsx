import React from "react";
import StateKit from "./StateKit";
import { ServiceState } from "../Types";
import { createPortal } from "react-dom";

// const States = {};

interface IStateBuilderProps {
  service: any;
  defaultState?: ServiceState;
  // singleState?: boolean;
  getBuilder?: (state: string) => any;
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

const StateBuilder = ({ service, defaultState = service.state, singleState = false, getBuilder, ...args }: IStateBuilderProps) => {
  [service.state, service.setState] = React.useState(defaultState);
  const _getBuilder = React.useMemo(() => {
    return (
      getBuilder ??
      ((state: ServiceState) => {
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
};
export default StateBuilder;
