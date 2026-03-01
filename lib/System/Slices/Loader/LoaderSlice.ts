import { createHive } from "../../../Hives";
import { LoaderMechanics } from "./LoaderMechanics";
import { LoaderAPI, LoaderDependencies, LoaderFunction, LoaderProps } from "./Types";

/**
 * LoaderSlice - Handles data loading with loading states
 *
 * ⚠️ **Requires:** StatusSlice must be added before this slice
 *
 * @example
 * // ✅ Correct
 * createFactory()
 *   .use(StatusSlice())
 *   .use(LoaderSlice({ loader: myLoader }))
 */

export function LoaderSlice<L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined, OperationName extends string = string>(
  props: LoaderProps<L, R, Fmt>
): (ctx: LoaderDependencies<OperationName>) => { loader: LoaderAPI<Fmt extends undefined ? R : Fmt> } {
  return (ctx: LoaderDependencies<OperationName>): { loader: LoaderAPI<Fmt extends undefined ? R : Fmt> } => {
    type Response = Fmt extends undefined ? R : Fmt;
    type Query = Parameters<L>[0];

    const loaderHive = createHive<Response>(undefined as any);
    let loading = false;

    const load = async (q?: Query, clearCache?: boolean): Promise<void> => {
      const useStatus = props.statusProps?.useStatus !== false && ctx.status;

      try {
        loading = true;
        // Cast "loader" to OperationName to allow internal usage even if restricted
        if (useStatus) ctx.status!.operation("loader" as OperationName).loading({});

        const data = await LoaderMechanics.load(props, q, clearCache);
        loaderHive.setHoney(data);

        if (useStatus) ctx.status!.operation("loader" as OperationName).idle();
      } catch (error) {
        if (useStatus) ctx.status!.operation("loader" as OperationName).error({ message: String(error) });
        throw error;
      } finally {
        loading = false;
      }
    };

    const reload = async (q?: Query): Promise<void> => {
      return load(q, true);
    };

    const clear = () => loaderHive.setHoney(undefined as any);

    const isLoading = () => loading;

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
      loader: {
        loaderHive,
        load,
        reload,
        isLoading,
      },
    };
  };
}
