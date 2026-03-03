import { IFormHive, IFormHiveValidator, FormValidateMode } from "../../Hives/Types";
import { LoaderFunction } from "../Loader/Types";
import { OperationHandlerFactory } from "../OperationHandler";

// ============================================================================
// FormSlice Configuration
// ============================================================================

export interface FormSliceConfig<T, Q = any> {
  initialValue: T;

  validator?: (key: keyof T, value: T[keyof T]) => string | undefined;
  getValidator?: (formHive: IFormHive<T>) => IFormHiveValidator<T>;

  validateMode?: FormValidateMode;

  onSubmit: (data: T) => void | Promise<void>;

  loader?: LoaderFunction<Q, T>;

  /** Named operations — auto-link to StatusSlice if present */
  operations?: { submit: string; load?: string };

  /** Override the default handler for all operations */
  operationHandler?: OperationHandlerFactory;
}

// ============================================================================
// FormSlice API
// ============================================================================

export interface FormAPI<T, Q = any> {
  hive: IFormHive<T>;
  submit: () => void;
  reset: (newValues?: Partial<T>) => void;
  load: (query?: Q) => Promise<void>;

  /** Declared operation names (undefined if no operations configured) */
  operations: { submit: string; load: string } | undefined;
}
