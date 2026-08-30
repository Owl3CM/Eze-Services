import { IHive } from "../../Hives";
import { FlowSliceConfig, FlowState, IStepDefinition } from "./Types";

/**
 * Builds the heavy navigation logic at construction time.
 * Captures hive, config, and factoryProvider — async nav methods
 * need all three for step validation, event hooks, and state updates.
 *
 * Does NOT own state, API composition, or simple queries — that's the slice's job.
 */
export function createFlowMechanics<F, StepKey extends string, FlowKey extends string>(
  hive: IHive<FlowState<StepKey, FlowKey>>,
  config: FlowSliceConfig<F, StepKey, FlowKey>,
  factoryProvider: () => F,
) {
  const getDefinition = (stepKey: StepKey): IStepDefinition<F> | undefined => config.registry[stepKey];

  // ─── Navigation ─────────────────────────────────────────────────────────

  async function goTo(targetStep: StepKey, direction: "forward" | "backward" | "idle" = "idle") {
    const { currentStep } = hive.honey;

    if (!config.registry[targetStep]) {
      console.error(`FlowSlice: Step ${targetStep} not found in registry`);
      return;
    }

    config.onStepChange?.(currentStep, targetStep, factoryProvider());

    hive.setHoney((prev) => ({
      ...prev,
      currentStep: targetStep,
      history: direction === "backward" ? prev.history : [...prev.history, currentStep],
      direction,
      status: "idle",
      error: undefined,
    }));

    getDefinition(targetStep)?.onEnter?.(factoryProvider());
  }

  async function next() {
    const { currentStep, sequence } = hive.honey;
    const currentIndex = sequence.indexOf(currentStep);
    const isLastStep = currentIndex >= sequence.length - 1;
    const currentDef = getDefinition(currentStep);

    // Always run onNext first — validation, side-effects, etc.
    if (currentDef?.onNext) {
      hive.setHoney((prev) => ({ ...prev, status: "transitioning", error: undefined }));
      try {
        const canProceed = await currentDef.onNext(factoryProvider());
        if (canProceed === false) {
          hive.setHoney((prev) => ({ ...prev, status: "idle" }));
          return;
        }
      } catch (err) {
        hive.setHoney((prev) => ({ ...prev, status: "error", error: String(err) }));
        return;
      }
    }

    // After onNext passes — complete or navigate
    if (isLastStep) {
      config.onFlowComplete?.(hive.honey.currentFlow, factoryProvider());
      return;
    }

    const nextStep = sequence[currentIndex + 1];
    goTo(nextStep, "forward");
  }

  async function back() {
    const { history } = hive.honey;
    if (history.length === 0) return;

    const newHistory = [...history];
    const target = newHistory.pop();

    if (target) {
      hive.setHoney((prev) => ({
        ...prev,
        currentStep: target,
        history: newHistory,
        direction: "backward",
        status: "idle",
        error: undefined,
      }));
    }
  }

  function switchFlow(flowKey: FlowKey, startAtStep?: StepKey) {
    const sequence = config.flows[flowKey];
    if (!sequence) {
      console.error(`FlowSlice: Flow ${flowKey} not found`);
      return;
    }

    hive.setHoney({
      currentFlow: flowKey,
      currentStep: startAtStep || sequence[0],
      sequence,
      history: [],
      direction: "idle",
      status: "idle",
    });
  }

  return { next, back, goTo, switchFlow };
}
