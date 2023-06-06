import React from "react";
import ServiceStateBuilder from "./ServiceStateBuilder";
import { ServiceState, State } from "../Types";
import StateBuilder from "./StateBuilder";
const service = new StateBuilder<State>();

const status: State[] = ["idle", "loading", "processing", "reloading", "searching", "error", "noContent", "loadingMore"];

setInterval(() => {
  const index = status.indexOf(service.state as any);
  const nextIndex = index + 1 >= status.length ? 0 : index + 1;
  service.setState(status[nextIndex]);
}, 1500);

const Test = () => {
  return (
    <div>
      <h1>Test Service State Builder</h1>
      <div className="bg-red" id="am-test-parent"></div>
      <ServiceStateBuilder
        service={service}
        idle={() => {
          return <p>nice</p>;
        }}
        otherSomthing={({ test }: any) => {
          return <p>other somthing {test}</p>;
        }}
      />
    </div>
  );
};

export default Test;
