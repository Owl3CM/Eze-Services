export type State = "idle" | "loading" | "processing" | "reloading" | "searching" | "error" | "noContent" | "loadingMore";

export type ServiceState<S = string> = S | State | { state: S | State; props: any; parent?: HTMLElement | undefined };

export interface QueryParam {
  id: string;
  value: any;
  title?: string;
}
export interface IQueryParams {
  [id: string]: QueryParam;
}
