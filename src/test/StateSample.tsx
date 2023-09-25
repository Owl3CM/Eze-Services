import React from "react";
import { ServiceStateBuilder, State, StateListener } from "../lib";
import StateKit from "../lib/stateKit/StateKit";

type Props = {};

interface IServiceTest {
  state: State;
  setState: (state: State) => void;
}

const StateSample = (props: Props) => {
  const service = React.useMemo<IServiceTest>(() => {
    return {
      state: "loading",
      setState: (state) => {
        service.state = state;
      },
    };
  }, []);

  return (
    <div>
      <div className="row gap-l">
        {Object.entries(StateKit).map(([key, Value]) => {
          return (
            <button
              key={key}
              onClick={() => {
                service.setState(key as any);
              }}>
              {key}
            </button>
          );
        })}
      </div>
      <ServiceStateBuilder service={service as any} />
    </div>
  );
};

export default StateSample;
