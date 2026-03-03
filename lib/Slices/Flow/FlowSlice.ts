import { Hive } from "../../Hives";
import { createFlowMechanics } from "./FlowMechanics";
import { FlowAPI, FlowSliceConfig, FlowState, IStepDefinition } from "./Types";

export function FlowSlice<F, StepKey extends string = string, FlowKey extends string = string>(config: FlowSliceConfig<F, StepKey, FlowKey>) {
  return (ctx: any): { flow: FlowAPI<StepKey, FlowKey, F> } => {
    // ─── Slice owns state ─────────────────────────────────────────────────
    const initialState: FlowState<StepKey, FlowKey> = {
      currentFlow: config.defaultFlow,
      currentStep: config.flows[config.defaultFlow][0],
      sequence: config.flows[config.defaultFlow],
      history: [],
      direction: "idle",
      status: "idle",
    };

    const hive = Hive.state<FlowState<StepKey, FlowKey>>(initialState);
    const factoryProvider = () => ctx as F;

    // Mechanics handles heavy navigation logic
    const m = createFlowMechanics(hive, config, factoryProvider);

    // ─── API Methods (slice owns composition) ─────────────────────────────

    const isFirstStep = () => hive.honey.sequence[0] === hive.honey.currentStep;

    const isLastStep = () => {
      const { sequence, currentStep } = hive.honey;
      return sequence[sequence.length - 1] === currentStep;
    };

    const getDefinition = (stepKey: StepKey): IStepDefinition<F> | undefined => config.registry[stepKey];

    const addStep = (key: StepKey, def: IStepDefinition<F>) => {
      config.registry[key] = def;
    };

    const defineFlow = (flowKey: FlowKey, sequence: StepKey[]) => {
      config.flows[flowKey] = sequence;
    };

    return {
      flow: {
        hive,
        next: m.next,
        back: m.back,
        goTo: m.goTo,
        switchFlow: m.switchFlow,
        isFirstStep,
        isLastStep,
        addStep,
        defineFlow,
        getDefinition,
      },
    };
  };
}
