// ============================================================================
// OperationHandler — Status notification abstraction
// ============================================================================
//
// Slices perform async work and need to notify about lifecycle transitions
// (loading, success, error, idle). They should NEVER know about StatusSlice,
// operation names, or status UI components.
//
// OperationHandler is the abstraction boundary:
//   - Slices know WHEN to notify (lifecycle semantics)
//   - Handlers know WHERE to notify (status bar, toast, console, nowhere)
// ============================================================================

/**
 * Lifecycle notification interface for async operations.
 *
 * Slices call these methods at the appropriate lifecycle points.
 * The handler decides what happens (update StatusSlice, show toast, nothing).
 */
export interface OperationHandler {
  loading: (data?: any) => void;
  error: (data?: any) => void;
  idle: () => void;
  success: (data?: any) => void;
}

/**
 * Factory that creates a handler from the factory context.
 * Resolved ONCE at build time (Rule 1: Build Clean, Run Lean).
 */
export type OperationHandlerFactory = (ctx: any) => OperationHandler;

/**
 * Silent handler — all calls are no-ops.
 * Use to explicitly disable status notifications.
 *
 * @example
 * LoaderSlice({ loader: fn, operationHandler: () => noopHandler })
 */
export const noopHandler: OperationHandler = {
  loading: () => {},
  error: () => {},
  idle: () => {},
  success: () => {},
};

/**
 * Default factory for named operations.
 * Delegates to `ctx.status.operation(name)` if StatusSlice is present, else noop.
 *
 * @example
 * // Auto-binds to ctx.status.operation("user-save")
 * FormSlice({ initialValue: {}, onSubmit: save, operations: { submit: "user-save" } })
 */
export function defaultOperationHandler(name: string): OperationHandlerFactory {
  return (ctx: any): OperationHandler => {
    if (ctx.status?.operation) {
      return ctx.status.operation(name);
    }
    return noopHandler;
  };
}

/**
 * Resolve an OperationHandlerFactory from an operation name and optional override.
 *
 * Priority: override > auto-link from name > noop
 */
export function resolveHandler(operation?: string, override?: OperationHandlerFactory): OperationHandlerFactory {
  return override ?? (operation ? defaultOperationHandler(operation) : () => noopHandler);
}

/**
 * Default factory for global status (ready state).
 * Delegates to `ctx.status.ready()` if StatusSlice is present, else noop.
 *
 * @example
 * // Auto-binds to ctx.status.ready()
 * ExporterSlice({ statusHandler: defaultReadyHandler() })
 */
export function defaultReadyHandler(): OperationHandlerFactory {
  return (ctx: any): OperationHandler => {
    if (ctx.status?.ready) {
      return ctx.status.ready();
    }
    return noopHandler;
  };
}
