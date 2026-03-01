import { IHive } from "../../../Hives";
import { ReactNode } from "react";

// ============================================================================
// StatusKit Types
// ============================================================================

/**
 * Defines a single status type configuration
 */
export interface StatusTypeConfig<P = any> {
  priority: number;
  props: P;
  component: (props: P) => ReactNode;
}

/**
 * A StatusKit is a record of status type names to their configurations
 */
export type IStatusKit<K extends string = string> = Record<K, StatusTypeConfig<any>>;

/**
 * Extract status type names from a StatusKit
 */
export type StatusTypeNames<K extends IStatusKit> = keyof K & string;

/**
 * Extract props type for a specific status type from a StatusKit
 */
export type StatusPropsFor<K extends IStatusKit, T extends StatusTypeNames<K>> = K[T]["props"];

// ============================================================================
// Operation State
// ============================================================================

/**
 * State for a single operation stored in the hive
 */
export interface OperationState<K extends IStatusKit = IStatusKit> {
  operation: string;
  statusType: StatusTypeNames<K>;
  props: any;
  priority: number;
  startedAt: number;
  timeout?: number;
}

// ============================================================================
// Status API Types
// ============================================================================

/**
 * Options for setting a status
 */
export interface StatusOptions {
  timeout?: number;
}

/**
 * The chain returned by operation(name) or ready()
 * Dynamically typed based on the StatusKit
 */
export type OperationChain<K extends IStatusKit = IStatusKit> = {
  [T in StatusTypeNames<K>]: (props: StatusPropsFor<K, T>, options?: StatusOptions) => void;
} & {
  idle: () => void;
};

/**
 * The main StatusSlice API exposed to slices and components
 */
export interface StatusAPI<K extends IStatusKit = IStatusKit, OperationName extends string = string> {
  // Main API
  operation: (name: OperationName) => OperationChain<K>;
  ready: () => OperationChain<K>;

  // Query API
  isActive: (operation: OperationName) => boolean;
  isAnyActive: (operations: OperationName[]) => boolean;
  getState: (operation: OperationName) => OperationState<K> | null;
  getPrimary: (operations?: OperationName[], statusTypes?: StatusTypeNames<K>[]) => OperationState<K> | null;
  getActiveOperations: () => OperationName[];
  getComponent: (statusType: StatusTypeNames<K>) => (props: any) => ReactNode;

  // Hive for component subscription
  hive: IHive<Map<string, OperationState<K>>>;
}

// ============================================================================
// StatusSlice Configuration
// ============================================================================

/**
 * Configuration for the StatusSlice
 */
export interface StatusSliceConfig<K extends IStatusKit = IStatusKit, OperationName extends string = string> {
  statusKit?: K;
  staleTimeout?: number;
  onStaleOperation?: (operation: OperationState<K>) => void;
  /**
   * Optional list of allowed operation names for type inference
   */
  allowedOperations?: readonly OperationName[];
}

// ============================================================================
// Default Status Types (Built-in)
// ============================================================================

export const DefaultStatusTypes = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
} as const;
