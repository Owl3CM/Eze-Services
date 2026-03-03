import { IHive, IHiveList } from "../../Hives";
import { OperationHandler } from "../OperationHandler";
import { PaginatorProps } from "./Types";

export type ArrayElement<R> =
  R extends Array<infer U>
    ? U // If R is an array
    : R extends { batch: Array<infer V> }
      ? V // If R is { batch: Array }
      : R extends { data: Array<infer W> }
        ? W // If R is { data: Array }
        : never;

export const PaginatorMechanics = {
  getArrayFromResponse: <R>(response: R): ArrayElement<R>[] => {
    if (typeof response === "object" && response !== null && "batch" in response) {
      return (response as { batch: ArrayElement<R>[] }).batch;
    }
    if (typeof response === "object" && response !== null && "data" in response) {
      return (response as { data: ArrayElement<R>[] }).data;
    }
    if (Array.isArray(response)) {
      return response as ArrayElement<R>[];
    }
    console.warn("Paginator response format unexpected:", response);
    return [];
  },

  exec: async <
    P extends {
      load: (...args: any[]) => Promise<any>;
      reload: (...args: any[]) => Promise<any>;
      loadMore: () => Promise<any>;
      hasMore: boolean;
      limit: number;
    },
    R,
    F,
    Item,
  >(
    handler: OperationHandler,
    props: PaginatorProps<P, R, F>,
    hive: IHiveList<Item>,
    canLoadHive: IHive<boolean>,
    fn: () => Promise<R>,
    append: boolean,
  ) => {
    const action = async () => {
      const raw = await fn();
      const formatted = props.format ? props.format(raw) : raw;
      const items = PaginatorMechanics.getArrayFromResponse(formatted) as Item[];
      append ? hive.append(items) : hive.setHoney(items);
      canLoadHive.setHoney(props.paginator.hasMore);
    };

    try {
      handler.loading({ variant: "skeleton" });
      await action();
      handler.idle();
    } catch (e) {
      handler.error({ message: String(e) });
      props.onError?.(e);
    }
  },
};
