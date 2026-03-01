import { createFormHive } from "../../../Hives/FormHive";
import { FormAPI, FormDependencies, FormSliceConfig } from "./Types";

/**
 * FormSlice - Handles form state, validation, and submission
 *
 * @param config Form configuration
 */
export function FormSlice<T, Q = any>(config: FormSliceConfig<T, Q>) {
  return (ctx: FormDependencies): { form: FormAPI<T, Q> } => {
    // Construct options object dynamically to satisfy discriminated union of createFormHive
    const statusOperation = ctx.status?.operation?.("form-submit" as any) ?? {
      loading: () => {},
      success: () => {},
      error: () => {},
      idle: () => {},
    };
    const hiveOptions: any = {
      initialValue: config.initialValue,
      validateMode: config.validateMode,
      onSubmit: async (values: T) => {
        try {
          statusOperation.loading({});
          await config.onSubmit(values);
          statusOperation.success({});
        } catch (error) {
          statusOperation.error({ message: String(error) });
        } finally {
          // Additional cleanup if needed
        }
      },
    };

    if (config.validator) {
      hiveOptions.validator = config.validator;
    } else if (config.getValidator) {
      hiveOptions.getValidator = config.getValidator;
    }

    // Create the underlying FormHive
    const hive = createFormHive<T>(hiveOptions);

    // Reset wrapper
    const reset = (newValues?: Partial<T>) => {
      (hive as any).reset(newValues);
      if (ctx.status) ctx.status.operation("form-submit" as any).idle();
    };

    // Load wrapper
    const load = async (query?: Q) => {
      if (!config.loader) {
        console.warn("FormSlice: load called but no loader configured");
        return;
      }

      try {
        if (ctx.status) ctx.status.operation("form-load" as any).loading({});
        const data = await config.loader(query, true); // true = clearCache if supported
        reset(data);
        if (ctx.status) ctx.status.operation("form-load" as any).idle();
      } catch (error) {
        if (ctx.status) ctx.status.operation("form-load" as any).error({ message: String(error) });
      }
    };

    // Submit wrapper
    const submit = () => {
      // Trigger FormHive submit (which handles validation)
      hive.submit();
    };

    return {
      form: {
        hive,
        reset,
        load,
        submit,
      },
    };
  };
}
