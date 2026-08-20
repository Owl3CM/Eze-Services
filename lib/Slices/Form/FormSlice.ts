import { Hive } from "../../Hives";
import { resolveHandler } from "../OperationHandler";
import { FormAPI, FormSliceConfig } from "./Types";

export function FormSlice<T, Q = any>(config: FormSliceConfig<T, Q>) {
  const ops = config.operations;

  // Rule 1: Build Clean, Run Lean — resolve handler factories at construction
  const submitFactory = resolveHandler(ops?.submit, config.operationHandler);
  const loadFactory = resolveHandler(ops?.load, config.operationHandler);

  // Resolved names for API exposure (undefined if no operations configured)
  const resolvedOps = ops ? { submit: ops.submit, load: ops.load ?? ops.submit } : undefined;

  return (ctx: any): { form: FormAPI<T, Q> } => {
    const submitOp = submitFactory(ctx);
    const loadOp = loadFactory(ctx);

    const hiveOptions: any = {
      initialValue: config.initialValue,
      validateMode: config.validateMode,
      onSubmit: async (values: T) => {
        try {
          submitOp.loading({});
          await config.onSubmit(values);
          submitOp.success({});
        } catch (error) {
          submitOp.error(errorPayload(error));
        }
      },
    };

    if (config.validator) {
      hiveOptions.validator = config.validator;
    } else if (config.getValidator) {
      hiveOptions.getValidator = config.getValidator;
    }

    const hive = Hive.form<T>(hiveOptions);

    const reset = (newValues?: Partial<T>) => {
      hive.reset(newValues);
      submitOp.idle();
    };

    const load = async (query?: Q) => {
      if (!config.loader) {
        console.warn("FormSlice: load called but no loader configured");
        return;
      }

      try {
        loadOp.loading({});
        const data = await config.loader(query, true);
        reset(data);
        loadOp.idle();
      } catch (error) {
        loadOp.error(errorPayload(error));
      }
    };

    const submit = () => {
      hive.submit();
    };

    return {
      form: {
        hive,
        reset,
        load,
        submit,
        operations: resolvedOps,
      },
    };
  };
}

function errorPayload(error: unknown) {
  const payload = { message: String(error) } as { message: string; error?: unknown };
  Object.defineProperty(payload, "error", { value: error, enumerable: false });
  return payload;
}
