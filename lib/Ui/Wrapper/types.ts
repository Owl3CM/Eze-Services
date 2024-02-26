import { ReloaderProps } from "./Wrapper";

export type IServiceAsProp = {
  state?: string;
  setState?: (state: string) => void;
  laod?: () => void;
  loadMore?: () => void;
  reload?: () => void;
  canLoadMore?: string;
};

export interface IWrapperProps {
  id?: string;
  service?: IServiceAsProp | any;
  className?: string;
  children?: React.ReactNode;
  reloader?: React.ReactNode;
  addStateBuilder?: boolean;
  reloaderProps?: ReloaderProps;
  loadMore?: (() => void) | null;
  reload?: (() => void) | null;
  style?: React.CSSProperties;
}

export interface onPullProps {
  diff: number;
  diffPercentage: number;
  reloader: HTMLElement;
}

export interface ListenToPullProps {
  container: HTMLElement;
  service: IServiceAsProp;
  reloaderProps: ReloaderProps;
  reload: () => void;
}
