import { createHiveArray } from "../Beehive";
import { loadingStauts } from "./DefaultsServiceFunctions";
import { IPaginatorService } from "./PaginatorService";
import { IService } from "./Service";
export const defaultLoad =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("loading");
    try {
      service.beforeLoad?.(true);
      const data = await func.load(service.queryParamsHive.honey);
      service.onResponse({ data, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError(error);
    }
  };

export const defaultReload =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("reloading");
    try {
      service.beforeReload?.(true);
      const data = await func.reload(service.queryParamsHive.honey);
      service.onResponse({ data, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError(error);
    }
  };

export const defaultLoadMore = (service: IPaginatorService) => async () => {
  service.statusHive.setHoney("loadingMore");
  try {
    service.beforeLoadMore?.();
    const data = await service.paginator.loadMore();
    service.onResponse({ data, hasMore: service.paginator.hasMore });
  } catch (error) {
    service.onError(error);
  }
};
interface DefaultOnPaginatorResProps<Response> {
  data: Response;
  clear?: boolean;
  hasMore: boolean;
}
export const defaultOnPaginatorRes = <Response, FormattedResponse>(service: IPaginatorService<any, Response, FormattedResponse, any>, formatResponse: any) => {
  // service.dataHive = createHiveArray<FormattedResponse>([] as FormattedResponse[]);

  service.dataHive.subscribe((data) => {
    setTimeout(() => {
      if (loadingStauts.includes(service.statusHive.honey)) service.statusHive.setHoney(data.length ? "idle" : "empty");
    }, 1);
  });
  if (formatResponse)
    return async ({ data, clear, hasMore }: DefaultOnPaginatorResProps<Response[]>) => {
      data = formatResponse(data);
      if (clear) service.dataHive.setHoney(data as any[]);
      else service.dataHive.append(data as any[]);
      setTimeout(() => {
        service.canLoadHive.setHoney(hasMore);
      }, 100);
    };
  else
    return async ({ data, clear, hasMore }: DefaultOnPaginatorResProps<FormattedResponse[]>) => {
      if (clear) service.dataHive.setHoney(data);
      else service.dataHive.append(data);
      setTimeout(() => {
        service.canLoadHive.setHoney(hasMore);
      }, 100);
    };
};
