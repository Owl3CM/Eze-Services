export type Status = "idle" | "loading" | "processing" | "reloading" | "searching" | "error" | "noContent" | "loadingMore";

export type ServiceStatus<S = any> = S | Status | { status: S | Status; props: any; parent?: HTMLElement | undefined };

export interface QueryParam {
  id: string;
  value: any;
  title?: string;
}
export interface IQueryParams {
  [id: string]: QueryParam;
}
