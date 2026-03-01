import { createHive, createHiveArray, IHive, IHiveArray } from "../../../Hives";
import { PaginatorDependencies, PaginatorProps } from "./Types";

export type ArrayElement<R> = R extends Array<infer U>
  ? U // If R is an array
  : R extends { batch: Array<infer V> }
  ? V // If R is { batch: Array }
  : R extends { data: Array<infer W> }
  ? W // If R is { data: Array }
  : never;

export const PaginatorMechanics = {
  getArrayFromResponse: <R>(response: R): ArrayElement<R>[] => {
    if (typeof response === "object" && response !== null && "batch" in response) {
      return (response as any).batch as ArrayElement<R>[];
    }
    if (typeof response === "object" && response !== null && "data" in response) {
      return (response as any).data as ArrayElement<R>[];
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
    OperationName extends string = string
  >(
    ctx: PaginatorDependencies<OperationName>,
    props: PaginatorProps<P, R, F>,
    hive: IHiveArray<Item>,
    canLoadHive: IHive<boolean>,
    fn: () => Promise<R>,
    append: boolean
  ) => {
    const action = async () => {
      const raw = await fn();
      type Data = F extends undefined ? R : F;
      const formatted = (props.format ? props.format(raw) : raw) as Data;
      const finalResponse = formatted as Item[];
      append ? hive.append(finalResponse) : hive.setHoney(finalResponse);
      canLoadHive.setHoney(props.paginator.hasMore);
    };

    try {
      ctx.status.operation("paginator" as OperationName).loading({ variant: "skeleton" });
      await action();
      ctx.status.operation("paginator" as OperationName).idle();
    } catch (e) {
      ctx.status.operation("paginator" as OperationName).error({ message: String(e) });
      props.onError?.(e);
    }
  },
};
