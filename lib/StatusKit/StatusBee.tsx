import React from "react";
import { StatusKit } from "./StatusKit";
import { ServiceStatus } from "../Types";
import { createPortal } from "react-dom";
import { IStateBuilder } from "./StateBuilder";
import { IHive, useHoney } from "../Beehive";

// const States = {};

interface IStateBuilderProps<S> {
  hive?: IHive<S>;
  service?: IStateBuilder<S>;
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

function StatusBee<S = null>({
  hive,
  service = {
    statusHive: hive as IHive<ServiceStatus<S>>,
  },
  statusKit: sk,
  singleState = false,
  getBuilder,
  ...args
}: IStateBuilderProps<S>) {
  const serviceStatus = useHoney(service.statusHive);
  const _getBuilder = React.useMemo(() => {
    return (
      getBuilder ??
      ((state: any) => {
        if (typeof state === "string") return { Builder: { ...StatusKit, ...service?.statusKit, ...args }[state], props: { service } };
        else if (typeof state === "object" && state.state)
          return { Builder: { ...StatusKit, ...service?.statusKit, ...args }[state.state], props: state.props, parent: state.parent };
        return {};
      })
    );
  }, [getBuilder]);

  let { Builder, parent, props } = _getBuilder(serviceStatus);
  if (!Builder) return null;
  else if (parent) return createPortal(<Builder {...props} />, parent);
  else return <Builder {...props} />;
}
export default StatusBee;
