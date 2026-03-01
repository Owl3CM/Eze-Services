import { createHive, IHive } from "../../../Hives";
import { StateKit } from "../../Constants";
import { OperationChain, OperationState, StatusAPI, IStatusKit, StatusOptions, StatusSliceConfig, StatusTypeNames } from "./Types";

const DEFAULT_OPERATION = "DEFAULT";

/**
 * StatusSlice V3 - Operations-based status management
 *
 * Features:
 * - Multiple concurrent operations
 * - String-based operation names (customizable via Generic)
 * - Dynamic status type methods from StatusKit
 * - Priority-based status resolution
 * - Scoped component listeners
 *
 * @example
 * // Basic usage
 * ctx.status.operation('table').loading({ variant: 'skeleton' });
 * ctx.status.operation('table').success({ message: 'Done!' });
 *
 * // Default operation
 * ctx.status.ready().loading({ message: 'Loading...' });
 */
export function StatusSlice<K extends IStatusKit, OperationName extends string = string>(config: StatusSliceConfig<K> = {}) {
  // Todo: fix this type issue, in proper way
  const { statusKit = StateKit as any as K, staleTimeout, onStaleOperation } = config;
  console.log({ statusKit });
  return (_ctx: any): { status: StatusAPI<K, OperationName> } => {
    // Single hive storing all operations
    const hive = createHive<Map<string, OperationState<K>>>(new Map());

    // Stale operation cleanup tracking
    const staleTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

    // Auto-remove operation after timeout
    const scheduleTimeout = (operation: string, timeout: number) => {
      // Clear existing timeout
      const existing = staleTimeouts.get(operation);
      if (existing) clearTimeout(existing);

      const timeoutId = setTimeout(() => {
        removeOperation(operation);
        staleTimeouts.delete(operation);
      }, timeout);

      staleTimeouts.set(operation, timeoutId);
    };

    // Schedule stale operation cleanup
    const scheduleStaleCleanup = (operation: string) => {
      if (!staleTimeout) return;

      const existing = staleTimeouts.get(operation);
      if (existing) clearTimeout(existing);

      const timeoutId = setTimeout(() => {
        const state = hive.honey.get(operation);
        if (state) {
          onStaleOperation?.(state);
          removeOperation(operation);
        }
        staleTimeouts.delete(operation);
      }, staleTimeout);

      staleTimeouts.set(operation, timeoutId);
    };

    // Update operation in the hive
    const setOperation = (operation: string, statusType: StatusTypeNames<K>, props: any, options?: StatusOptions) => {
      const kitEntry = statusKit[statusType];
      if (!kitEntry) {
        console.warn(`StatusSlice: Unknown status type "${statusType}"`);
        return;
      }

      const state: OperationState<K> = {
        operation,
        statusType,
        props,
        priority: kitEntry.priority,
        startedAt: Date.now(),
        timeout: options?.timeout,
      };

      const newMap = new Map(hive.honey);
      newMap.set(operation, state);
      hive.setHoney(newMap);

      // Handle timeouts
      if (options?.timeout) {
        scheduleTimeout(operation, options.timeout);
      } else {
        scheduleStaleCleanup(operation);
      }
    };

    // Remove operation from the hive
    const removeOperation = (operation: string) => {
      const existing = staleTimeouts.get(operation);
      if (existing) {
        clearTimeout(existing);
        staleTimeouts.delete(operation);
      }

      const newMap = new Map(hive.honey);
      if (newMap.has(operation)) {
        newMap.delete(operation);
        hive.setHoney(newMap);
      }
    };

    // Create operation chain with dynamic status type methods
    const createOperationChain = (operation: string): OperationChain<K> => {
      // Todo: optimze this to be built in diff way so it's not re-created on every render
      const chain: any = {
        idle: () => removeOperation(operation),
      };

      // Dynamically add methods for each status type in the kit
      Object.keys(statusKit).forEach((statusType) => {
        chain[statusType] = (props: any, options?: StatusOptions) => {
          setOperation(operation, statusType as StatusTypeNames<K>, props, options);
        };
      });

      return chain;
    };

    // Query: Get primary operation (highest priority) with optional filtering
    const getPrimary = (operations?: OperationName[], statusTypes?: StatusTypeNames<K>[]): OperationState<K> | null => {
      let candidates = Array.from(hive.honey.values());

      // Filter by operations if provided
      if (operations && operations.length > 0) {
        candidates = candidates.filter((s) => operations.includes(s.operation as OperationName));
      }

      // Filter by status types if provided
      if (statusTypes && statusTypes.length > 0) {
        candidates = candidates.filter((s) => statusTypes.includes(s.statusType as StatusTypeNames<K>));
      }

      if (candidates.length === 0) return null;

      // Sort by priority (lower number = higher priority)
      candidates.sort((a, b) => a.priority - b.priority);
      return candidates[0];
    };

    return {
      status: {
        // Main API
        operation: (name: OperationName) => createOperationChain(name as string),
        ready: () => createOperationChain(DEFAULT_OPERATION),

        // Query API
        isActive: (operation: OperationName) => hive.honey.has(operation as string),

        isAnyActive: (operations: OperationName[]) => operations.some((op) => hive.honey.has(op as string)),

        getState: (operation: OperationName) => hive.honey.get(operation as string) || null,

        getPrimary,

        getActiveOperations: () => Array.from(hive.honey.keys()) as OperationName[],

        getComponent: (statusType: StatusTypeNames<K>) => {
          const kitEntry = statusKit[statusType];
          return kitEntry?.component || (() => null);
        },

        // Hive for subscription
        hive: hive as IHive<Map<string, OperationState<K>>>,
      },
    };
  };
}
