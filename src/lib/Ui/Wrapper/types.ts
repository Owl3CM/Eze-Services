import { ReloaderProps } from "./Wrapper";

export type IService = {
  state?: string;
  setState?: (state: string) => void;
  laod?: () => void;
  loadMore?: () => void;
  reload?: () => void;
  canLoadMore?: string;
};

export interface IWrapperProps {
  service?: IService | any;
  className?: string;
  children?: React.ReactNode;
  reloader?: React.ReactNode;
  addStateBuilder?: boolean;
  reloaderProps?: ReloaderProps;
  loadMore?: (() => void) | null;
  reload?: (() => void) | null;
}

export interface onPullProps {
  diff: number;
  diffPercentage: number;
  reloader: HTMLElement;
}

export interface ListenToPullProps {
  container: HTMLElement;
  service: IService;
  reloaderProps: ReloaderProps;
  reload: () => void;
}
