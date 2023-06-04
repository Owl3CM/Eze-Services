import { ServiceState, State } from "../Types";

// export type IStateBuilder<S> = {
//   state: ServiceState<S | State>;
//   setState: React.Dispatch<React.SetStateAction<S | State>>;
//   stateKit?: any;
// };

export default class StateBuilder<S = State> {
  state: ServiceState<S | State> = "idle";
  setState: React.Dispatch<React.SetStateAction<ServiceState<S | State>>> = () => {};
  stateKit?: any;
}

export type IStateBuilder<S> = StateBuilder<S | State>;
