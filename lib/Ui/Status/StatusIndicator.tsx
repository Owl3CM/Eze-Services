import React, { ReactNode } from "react";
import { useHoney } from "../../Hooks";
import { StatusAPI, IStatusKit, StatusTypeNames, OperationState } from "../../Slices/Status/Types";

// ============================================================================
// StatusIndicator - Generic scoped indicator
// ============================================================================

interface StatusIndicatorProps<K extends IStatusKit, OperationName extends string = string> {
  /** The status API from the factory */
  status: StatusAPI<K, OperationName>;
  /** Optional: Only listen to these operations */
  operations?: readonly OperationName[];
  /** Optional: Only show these status types */
  statusTypes?: StatusTypeNames<K>[];
  /** Optional: Custom render function */
  children?: (state: OperationState<K> | null) => ReactNode;
}

/**
 * StatusIndicator - Displays status based on active operations
 *
 * @example
 * // Show status for all operations
 * <StatusIndicator status={status} />
 *
 * // Scoped to specific operations
 * <StatusIndicator
 *   status={status}
 *   operations={['table', 'table-sort']}
 * />
 *
 * // Custom render
 * <StatusIndicator status={status}>
 *   {(state) => state ? <CustomLoader /> : null}
 * </StatusIndicator>
 */
export function StatusIndicator<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
  statusTypes,
  children,
}: StatusIndicatorProps<K, OperationName>): ReactNode {
  // Subscribe to hive changes
  useHoney(status.hive);

  // Get the primary operation state based on filters
  // Cast operations to string[] for internal logic if needed, but getPrimary accepts OperationName[]
  const primaryState = status.getPrimary(operations as OperationName[], statusTypes);

  // Custom render if provided
  if (children) {
    return children(primaryState);
  }

  // No active operation
  if (!primaryState) {
    return null;
  }

  // Get component from kit and render
  const Component = status.getComponent(primaryState.statusType);
  return <Component {...primaryState.props} />;
}

// ============================================================================
// Type-specific convenience components
// ============================================================================

interface TypedIndicatorProps<K extends IStatusKit, OperationName extends string = string> {
  status: StatusAPI<K, OperationName>;
  operations?: readonly OperationName[];
}

/**
 * LoadingIndicator - Only shows loading status
 */
export function LoadingIndicator<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
}: TypedIndicatorProps<K, OperationName>): ReactNode {
  return <StatusIndicator status={status} operations={operations} statusTypes={["loading"] as StatusTypeNames<K>[]} />;
}

/**
 * ErrorDisplay - Only shows error status
 */
export function ErrorDisplay<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
}: TypedIndicatorProps<K, OperationName>): ReactNode {
  return <StatusIndicator status={status} operations={operations} statusTypes={["error"] as StatusTypeNames<K>[]} />;
}

/**
 * SuccessToast - Only shows success status
 */
export function SuccessToast<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
}: TypedIndicatorProps<K, OperationName>): ReactNode {
  return <StatusIndicator status={status} operations={operations} statusTypes={["success"] as StatusTypeNames<K>[]} />;
}

// ============================================================================
// StatusGuard - Conditional rendering
// ============================================================================

interface StatusGuardProps<K extends IStatusKit, OperationName extends string = string> {
  status: StatusAPI<K, OperationName>;
  operations?: readonly OperationName[];
  statusTypes?: StatusTypeNames<K>[];
  fallback: ReactNode;
  blockingTypes?: StatusTypeNames<K>[];
  children: ReactNode;
}

/**
 * StatusGuard - Show fallback while status is active, otherwise show children
 *
 * @example
 * <StatusGuard
 *   status={status}
 *   operations={['table']}
 *   statusTypes={['success']}
 *   blockingTypes={['loading', 'saving']}
 *   fallback={<Skeleton />}
 * >
 *   <TableContent />
 * </StatusGuard>
 */
export function StatusGuard<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
  statusTypes,
  fallback,
  blockingTypes = ["loading", "saving"],
  children,
}: StatusGuardProps<K, OperationName>): ReactNode {
  useHoney(status.hive);

  const primaryState = status.getPrimary(operations as OperationName[], statusTypes);

  // Show fallback if any matching status is active
  if (primaryState) {
    // Check if it's a "blocking" status (loading, saving, etc.)
    if (blockingTypes.includes(primaryState.statusType as string)) {
      return fallback;
    }
  }

  return children;
}

// ============================================================================
// ProgressBar - For status types with progress
// ============================================================================

interface ProgressBarProps<K extends IStatusKit, OperationName extends string = string> {
  status: StatusAPI<K, OperationName>;
  operations: readonly OperationName[];
  className?: string;
}

/**
 * ProgressBar - Shows progress from status props
 *
 * @example
 * <ProgressBar
 *   status={status}
 *   operations={['upload']}
 * />
 */
export function ProgressBar<K extends IStatusKit, OperationName extends string = string>({
  status,
  operations,
  className,
}: ProgressBarProps<K, OperationName>): ReactNode {
  useHoney(status.hive);

  const state = status.getPrimary(operations as OperationName[]);

  if (!state || !("progress" in state.props)) {
    return null;
  }

  const progress = state.props.progress as number;

  return (
    <div className={className || "status-progress-bar"}>
      <div className="status-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

// ============================================================================
// Re-export for convenience
// ============================================================================

export const StatusComponents = {
  StatusIndicator,
  LoadingIndicator,
  ErrorDisplay,
  SuccessToast,
  StatusGuard,
  ProgressBar,
};
