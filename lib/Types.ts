import { DefaultStatusKit } from "./System/Constants/StatusDefaults";

export type Status = keyof typeof DefaultStatusKit;

export type ServiceStatus<S = any> = S | Status | { status: S | Status; props: any; parent?: HTMLElement | undefined };

export interface QueryParam {
  id: string;
  value: any;
  title?: string;
}
export interface IQueryParams {
  [id: string]: QueryParam;
}
