import { createHiveArray } from "../Beehive";
import { IPaginatorService } from "./PaginatorService";
import { IService } from "./Service";
const loadingStauts = ["loading", "reloading", "loadingMore", "idle"];
export const defaultLoad =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("loading");
    try {
      service.beforeLoad?.(service, true);
      const data = await func.load(service.queryParamsHive.honey);
      service.onResponse({ data, service, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError({ error, service });
    }
  };

export const defaultReload =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("reloading");
    try {
      service.beforeReload?.(service, true);
      const data = await func.reload(service.queryParamsHive.honey);
      service.onResponse({ data, service, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError({ error, service });
    }
  };

export const defaultLoadMore = (service: IPaginatorService) => async () => {
  service.statusHive.setHoney("loadingMore");
  try {
    service.beforeLoadMore?.(service);
    const data = await service.paginator.loadMore();
    service.onResponse({ data, service, hasMore: service.paginator.hasMore });
  } catch (error) {
    service.onError({ error, service });
  }
};
interface defaultOnResponse<Response> {
  data: Response;
  service: IService;
  clear?: boolean;
  hasMore: boolean;
}
export const defaultOnResponse = <Response>(service: IService) => {
  service.dataHive = createHiveArray<Response>([] as Response[]);
  service.dataHive.subscribe((data) => {
    if (loadingStauts.includes(service.statusHive.honey)) service.statusHive.setHoney(data.length ? "idle" : "empty");
  });
  return async ({ data, service, clear, hasMore }: defaultOnResponse<Response[]>) => {
    if (clear) service.dataHive.setHoney(data);
    else service.dataHive.append(data);
    setTimeout(() => {
      service.canLoadHive.setHoney(hasMore);
    }, 100);
  };
};
interface defaultOnErrorProps {
  error: any;
  service: IPaginatorService;
}

export const defaultOnError =
  (service: IPaginatorService) =>
  ({ error, service }: defaultOnErrorProps) => {
    console.error(error);
    if (error.stack) error = { message: error.message, stack: error.stack };
    service.statusHive.setHoney({ state: "error", props: { error, service } } as any);
  };

// export const defaultAfterLoad = async (data: any, service: IClientService) => {
//     defaultOnResponse(data, service, true);
// };

// export const defaultAfterLoadMore = async (data: any, service: IClientService) => {
//     defaultOnResponse(data, service, false);
// };
