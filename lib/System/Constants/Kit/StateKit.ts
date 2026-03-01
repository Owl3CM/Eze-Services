import Loading from "./Loading";
import Error from "./Error";
import Progressing from "./Progressing";
import NoContent from "./NoContent";

const StateKit = {
  error: Error,
  processing: Progressing,
  loading: Loading,
  noContent: NoContent,
  empty: NoContent,
  reloading: Loading,
};

export default StateKit;

export type IState = keyof typeof StateKit;

export type ServiceState = IState | { state: IState; props: any; parent?: HTMLElement | undefined };
