import { IHive } from "../../Beehive";
import { ReloaderProps } from "./Wrapper";

export type IServiceAsProp = {
  laod?: () => void;
  loadMore?: () => void;
  reload?: () => void;
  canLoadHive?: IHive<boolean>;
  statusHive?: IHive<string>;
  statusKit?: any;
};

export interface IWrapperProps {
  id?: string;
  service?: IServiceAsProp | any;
  className?: string;
  children?: React.ReactNode;
  reloader?: React.ReactNode;
  subscribeToStatus?: boolean;
  canLoadHive?: IHive<boolean>;
  statusHive?: IHive<string>;
  statusKit?: any;
  reloaderProps?: ReloaderProps;
  loadMore?: (() => void) | null;
  reload?: (() => void) | null;
  style?: React.CSSProperties;
  rememberScrollPosition?: boolean;
}

export interface onPullProps {
  diff: number;
  diffPercentage: number;
  reloader: HTMLElement;
}

export interface ListenToPullProps {
  container: HTMLElement;
  statusHive: IHive<any>;
  reloaderProps: ReloaderProps;
  reload: () => void;
}
