import { ServiceConstructor } from "./Types";
import { defaultLoad, defaultOnError, defaultOnRes, defaultReload } from "./DefaultsServiceFunctions";
import { ServiceStatus } from "../Types";
import { IHive, createHive } from "../Beehive";
export type IService<QueryParams = Object, Response = any, FormattedResponse = Response, Status = ServiceStatus> = Service<
  QueryParams,
  Response,
  FormattedResponse,
  Status
>;

export class Service<QueryParams = Object, Response = any, FormattedResponse = Response, Status = ServiceStatus> {
  constructor(props: ServiceConstructor<QueryParams, Response, FormattedResponse>) {
    const { formatResponse, loader, onError, onResponse, afterLoad, afterReload, beforeLoad, beforeReload = beforeLoad, initialValue } = props as any;

    Object.assign(this, {
      onError: onError ?? defaultOnError(this as any),
    });

    if (loader) {
      this.loader = loader;
      Object.assign(this, {
        onResponse: onResponse ?? defaultOnRes<Response, FormattedResponse>(this, formatResponse, initialValue),
      });
      if (loader.load)
        Object.assign(this, {
          load: defaultLoad(this as any),
          afterLoad,
          beforeLoad,
        });

      if (loader.reload)
        Object.assign(this, {
          reload: defaultReload(this as any),
          afterReload,
          beforeReload,
        });

      this.queryParamsHive.subscribe(() => {
        this.load();
      });
    }
  }

  dataHive: IHive<FormattedResponse> = createHive(null as any);
  queryParamsHive: IHive<QueryParams> = createHive({} as any);

  statusHive: IHive<Status> = createHive<Status>("idle" as Status);
  statusKit?: any;

  setQueryParams = (prev: QueryParams | ((prev: QueryParams) => QueryParams)) => {
    this.queryParamsHive.setHoney(prev);
  };
  updateQueryParams = (params: QueryParams) => {
    this.queryParamsHive.setHoney((prev) => ({ ...prev, ...params }));
  };

  loader: {
    load: (queryParams?: QueryParams) => Promise<Response>;
    reload: (queryParams?: QueryParams) => Promise<Response>;
  } = {} as any;

  load = async () => Promise<Response>;
  reload = async () => Promise<Response>;

  onError = (err: any) => {
    this.statusHive.setHoney({ status: "error", props: { error: err } } as any);
  };

  onResponse = async (data: Response) => {};

  afterLoad = (data: FormattedResponse) => {};
  afterReload = (data: FormattedResponse) => {};

  beforeLoad = (clearCash: boolean) => {};
  beforeReload = (clearCash: boolean) => {};
}
