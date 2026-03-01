import { PaginatorAPI } from "../Slices/Paginator/Types";
import { StatusAPI, IStatusKit } from "../Slices/Status/Types";
import { TableAPI } from "../Slices/Table/Types";
import { ExporterAPI } from "../Slices/Exporter/Types";
import { LoaderAPI } from "../Slices/Loader/Types";
import { QueryAPI, QueryComponentMap } from "../Slices/Query/Types";

export interface IPaginatorFactory<T> {
  paginator: PaginatorAPI<T>;
}

export interface ILoaderFactory<Response> {
  loader: LoaderAPI<Response>;
}

export interface IStatusFactory<K extends IStatusKit = any, Op extends string = any> {
  status: StatusAPI<K, Op>;
}

export interface IQueryFactory<M extends QueryComponentMap = any> {
  query: QueryAPI<M>;
}

export interface ITableFactory<T> {
  table: TableAPI<T>;
}

export interface IExporterFactory {
  exporter: ExporterAPI;
}
