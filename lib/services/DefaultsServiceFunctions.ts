import { createHive } from "../Beehive";
import { IPaginatorService } from "./PaginatorService";
import { IService } from "./Service";

export const loadingStatus = ["loading", "reloading", "loadingMore", "idle"];

export const defaultLoad =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("loading");
    try {
      service.beforeLoad?.(true);
      service.onResponse(await func.load(service.queryParamsHive.honey));
    } catch (error) {
      service.onError({ error });
    }
  };

export const defaultReload =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("reloading");
    try {
      service.beforeReload?.(true);
      service.onResponse(await func.reload(service.queryParamsHive.honey));
    } catch (error) {
      service.onError({ error });
    }
  };

interface defaultOnRes<Response> {
  data: Response;
}

export const defaultOnRes = <Response, FormattedResponse>(
  service: IService<any, Response, FormattedResponse, any>,
  formatResponse: any,
  initialValue: FormattedResponse
) => {
  service.dataHive = createHive<FormattedResponse>(initialValue);
  service.dataHive.subscribe((data) => {
    if (loadingStatus.includes(service.statusHive.honey)) service.statusHive.setHoney(data ? "idle" : "empty");
  });
  if (formatResponse)
    return async (data: Response) => {
      service.dataHive.setHoney(formatResponse(data) as any);
    };
  else
    return async (data: FormattedResponse) => {
      service.dataHive.setHoney(data as FormattedResponse);
    };
};

export const defaultOnError = (service: IPaginatorService | IService) => (error: any) => {
  console.error(error);
  if (!error) error = { message: "Unknown error" };
  if (error.stack) error = { message: error.message, stack: error.stack };
  service.statusHive.setHoney({ state: "error", props: { error, service } } as any);
};
