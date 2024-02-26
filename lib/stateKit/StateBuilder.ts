import { ServiceState, State } from "../Types";

// export type IStateBuilder<S> = {
//   state: ServiceState<S | State>;
//   setState: React.Dispatch<React.SetStateAction<S | State>>;
//   stateKit?: any;
// };

export default class StateBuilder<S = State> {
  state: ServiceState<S> = "idle";
  setState = (state: typeof this.state) => {
    this.state = state;
  };
  stateKit?: any;
  constructor() {}
}

export type IStateBuilder<S = State> = StateBuilder<S>;
