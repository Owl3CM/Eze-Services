import { IFormHive, IFormHiveValidator, INestedFormHive, FormValidateMode } from "../../../Hives/Types";
import { LoaderFunction } from "../Loader/Types";
import { StatusAPI } from "../Status/Types";

// ============================================================================
// FormSlice Configuration
// ============================================================================

export interface FormSliceConfig<T, Q = any> {
  // Initial Value
  initialValue: T;

  // Validator function
  validator?: (key: keyof T, value: T[keyof T]) => string | undefined;
  getValidator?: (formHive: IFormHive<T>) => IFormHiveValidator<T>;

  // Validation Mode
  validateMode?: FormValidateMode;

  // Submission handler
  onSubmit: (data: T) => void | Promise<void>;

  // Optional: Data Loader (e.g., for edit mode)
  loader?: LoaderFunction<Q, T>;
}

// ============================================================================
// FormSlice API
// ============================================================================

export interface FormAPI<T, Q = any> {
  /**
   * The underlying FormHive instance
   */
  hive: IFormHive<T>;

  /**
   * Triggers submission (validates + calls onSubmit)
   */
  submit: () => void;

  /**
   * Resets the form to initial values (or new provided values)
   */
  reset: (newValues?: Partial<T>) => void;

  /**
   * Loads data into the form using the configured loader
   */
  load: (query?: Q) => Promise<void>;
}

// ============================================================================
// Dependencies
// ============================================================================

export interface FormDependencies {
  status?: StatusAPI;
}
