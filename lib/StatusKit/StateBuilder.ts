import { IHive, createHive } from "../Beehive/Hive";
import { ServiceStatus, Status } from "../Types";

// export type IStateBuilder<S> = {
//   state: ServiceState<S | Status>;
//   setState: React.Dispatch<React.SetStateAction<S | Status>>;
//   statusKit?: any;
// };

export default class StatusService<S = Status> {
  statusHive: IHive<S | ServiceStatus> = createHive<S | ServiceStatus>("idle" as S);
  statusKit?: any;
  constructor() {}
}

export type IStateBuilder<S = Status> = StatusService<S>;
