import { createHive } from "../../../Hives";
import { FlowMechanics } from "./FlowMechanics";
import { FlowAPI, FlowSliceConfig, FlowState } from "./Types";

/**
 * FlowSlice - Multi-step navigation and wizard manager.
 *
 * @param config Configuration for registry and flows
 */
export function FlowSlice<F, StepKey extends string = string, FlowKey extends string = string>(config: FlowSliceConfig<F, StepKey, FlowKey>) {
  return (ctx: any): { flow: FlowAPI<StepKey, FlowKey, F> } => {
    // Initial State
    const initialState: FlowState<StepKey, FlowKey> = {
      currentFlow: config.defaultFlow,
      // Default to first step of default flow
      currentStep: config.flows[config.defaultFlow][0],
      sequence: config.flows[config.defaultFlow],
      history: [],
      direction: "idle",
      status: "idle",
    };

    const hive = createHive<FlowState<StepKey, FlowKey>>(initialState);

    // Factory Provider:
    // We assume 'ctx' passed to this slice function IS the factory (or contains it).
    // In Eze-Factory pattern, 'ctx' is usually the object being built.
    // However, it's not fully constructed yet.
    // But since we use a reference () => ctx, it should be fine when called at runtime.
    const factoryProvider = () => ctx as F;

    const mechanics = new FlowMechanics<F, StepKey, FlowKey>(hive, config, factoryProvider);

    return {
      flow: mechanics.getAPI(),
    };
  };
}
