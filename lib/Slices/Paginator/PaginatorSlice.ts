import { Hive, IHiveList } from "../../Hives";
import { resolveHandler } from "../OperationHandler";
import { ArrayElement, PaginatorMechanics } from "./PaginatorMechanics";
import { PaginatorAPI, PaginatorDependencies, PaginatorProps } from "./Types";

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
>(props: PaginatorProps<P, R, F>): (ctx: PaginatorDependencies) => { paginator: PaginatorAPI<ArrayElement<F extends undefined ? R : F>> } {
  // Rule 1: Build Clean, Run Lean — resolve handler factory at construction
  const handlerFactory = resolveHandler(props.operation, props.operationHandler);

  return (ctx: PaginatorDependencies): { paginator: PaginatorAPI<ArrayElement<F extends undefined ? R : F>> } => {
    type Data = F extends undefined ? R : F;
    type Item = ArrayElement<Data>;
    type Query = Parameters<P["load"]>[0];

    const op = handlerFactory(ctx);

    const hive = Hive.list<Item>([]);
    const canLoadHive = Hive.state(false);

    const load = (q?: Query) => PaginatorMechanics.exec(op, props, hive, canLoadHive, () => props.paginator.load(q), false);
    const reload = (q?: Query) => PaginatorMechanics.exec(op, props, hive, canLoadHive, () => props.paginator.reload(q), false);
    const loadMore = () => PaginatorMechanics.exec(op, props, hive, canLoadHive, () => props.paginator.loadMore(), true);

    const clear = () => hive.setHoney([]);

    let unsubQuery: (() => void) | undefined;
    if (ctx.query) {
      if (props.shouldLoadOnQueryChange) {
        unsubQuery = ctx.query.listenToQuery((q: Query) => {
          const shouldLoad = props.shouldLoadOnQueryChange!(q, { clear });
          if (shouldLoad) load(q);
        });
      } else {
        unsubQuery = ctx.query.listenToQuery((q: Query) => load(q));
      }
    } else load();

    return {
      paginator: {
        paginatorHive: hive as IHiveList<Item>,
        load: load as (q?: Query) => Promise<void>,
        reload: reload as (q?: Query) => Promise<void>,
        loadMore,
        get hasMore() {
          return canLoadHive.honey;
        },
        limit: props.paginator.limit,
        canLoadHive,
        operation: props.operation,
        dispose: unsubQuery,
      },
    };
  };
}
