import { createHive, createHiveArray, IHiveArray } from "../../../Hives";
import { ArrayElement, PaginatorMechanics } from "./PaginatorMechanics";
import { PaginatorAPI, PaginatorDependencies, PaginatorProps } from "./Types";

/**
 * PaginatorSlice - Handles pagination with loading states
 *
 * ⚠️ **Requires:** StatusSlice must be added before this slice
 *
 * @example
 * // ✅ Correct
 * createFactory()
 *   .use(StatusSlice())
 *   .use(PaginatorSlice({ paginator: myPaginator }))
 */
export function PaginatorSlice<
  P extends {
    load: (...args: any[]) => Promise<any>;
    reload: (...args: any[]) => Promise<any>;
    loadMore: () => Promise<any>;
    hasMore: boolean;
    limit: number;
  },
  R = Awaited<ReturnType<P["load"]>>,
  F = undefined,
  OperationName extends string = string
>(props: PaginatorProps<P, R, F>): (ctx: PaginatorDependencies<OperationName>) => { paginator: PaginatorAPI<ArrayElement<F extends undefined ? R : F>> } {
  return (ctx: PaginatorDependencies<OperationName>): { paginator: PaginatorAPI<ArrayElement<F extends undefined ? R : F>> } => {
    type Data = F extends undefined ? R : F;
    type Item = ArrayElement<Data>;
    type Query = Parameters<P["load"]>[0];

    const hive = createHiveArray<Item>([]);
    const canLoadHive = createHive(false);

    const load = (q?: Query) => PaginatorMechanics.exec(ctx as any, props, hive, canLoadHive, () => props.paginator.load(q), false);
    const reload = (q?: Query) => PaginatorMechanics.exec(ctx as any, props, hive, canLoadHive, () => props.paginator.reload(q), false);
    const loadMore = () => PaginatorMechanics.exec(ctx as any, props, hive, canLoadHive, () => props.paginator.loadMore(), true);

    const clear = () => hive.setHoney([]);

    if (ctx.query) {
      if (props.shouldLoadOnQueryChange) {
        ctx.query.listenToQuery((q: Query) => {
          const shouldLoad = props.shouldLoadOnQueryChange!(q, { clear });
          if (shouldLoad) load(q);
        });
      } else {
        ctx.query.listenToQuery((q: Query) => load(q));
      }
    } else load();

    return {
      paginator: {
        paginatorHive: hive as IHiveArray<Item>,
        load: load as (q?: Query) => Promise<void>,
        reload: reload as (q?: Query) => Promise<void>,
        loadMore,
        hasMore: props.paginator.hasMore,
        limit: props.paginator.limit,
        canLoadHive,
      },
    };
  };
}
