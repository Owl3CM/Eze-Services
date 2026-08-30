import { Hive } from "../../Hives";
import { resolveHandler } from "../OperationHandler";
import { LoaderMechanics } from "./LoaderMechanics";
import { LoaderAPI, LoaderDependencies, LoaderFunction, LoaderProps } from "./Types";

export function LoaderSlice<L extends LoaderFunction, R = Awaited<ReturnType<L>>, Fmt = undefined>(
  props: LoaderProps<L, R, Fmt>,
): (ctx: LoaderDependencies) => { loader: LoaderAPI<Fmt extends undefined ? R : Fmt> } {
  // Rule 1: Build Clean, Run Lean — resolve handler factory at construction
  const handlerFactory = resolveHandler(props.operation, props.operationHandler);

  return (ctx: LoaderDependencies): { loader: LoaderAPI<Fmt extends undefined ? R : Fmt> } => {
    type Response = Fmt extends undefined ? R : Fmt;
    type Query = Parameters<L>[0];

    const op = handlerFactory(ctx);

    const loaderHive = Hive.state<Response>(undefined as any);
    let loading = false;

    const load = async (q?: Query, clearCache?: boolean): Promise<void> => {
      try {
        loading = true;
        op.loading({});

        const data = await LoaderMechanics.load(props, q, clearCache);
        loaderHive.setHoney(data);

        op.idle();
      } catch (error) {
        op.error(errorPayload(error));
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
        operation: props.operation,
      },
    };
  };
}

function errorPayload(error: unknown) {
  const payload = { message: String(error) } as { message: string; error?: unknown };
  Object.defineProperty(payload, "error", { value: error, enumerable: false });
  return payload;
}
