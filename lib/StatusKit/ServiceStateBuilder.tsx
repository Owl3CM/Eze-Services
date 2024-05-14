import React from "react";
import StateKit from "./StatusKit";
import { ServiceStatus, Status } from "../Types";
import { createPortal } from "react-dom";

interface IStateBuilderProps<S> {
  service: {
    state: ServiceStatus<S>;
    setState: React.Dispatch<React.SetStateAction<ServiceStatus<S>>>;
    statusKit?: any;
  };
  defaultState?: ServiceStatus<S>;
  // singleState?: boolean;
  getBuilder?: (state: ServiceStatus<S>) => any;
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

export function ServiceStateBuilder<S = null>({ service, defaultState = service.state, singleState = false, getBuilder, ...args }: IStateBuilderProps<S>) {
  [service.state, service.setState] = React.useState(defaultState);
  const _getBuilder = React.useMemo(() => {
    return (
      getBuilder ??
      ((state: any) => {
        if (typeof state === "string") return { Builder: { ...StateKit, ...service?.statusKit, ...args }[state], props: { service } };
        else if (typeof state === "object" && state.state)
          return { Builder: { ...StateKit, ...service?.statusKit, ...args }[state.state], props: state.props, parent: state.parent };
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
