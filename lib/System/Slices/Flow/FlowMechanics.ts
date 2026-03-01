import { IHive } from "../../../Hives";
import { FlowAPI, FlowSliceConfig, FlowState, IStepDefinition } from "./Types";

/**
 * FlowMechanics - Core logic for FlowSlice
 */
export class FlowMechanics<F, StepKey extends string, FlowKey extends string> {
  constructor(private hive: IHive<FlowState<StepKey, FlowKey>>, private config: FlowSliceConfig<F, StepKey, FlowKey>, private factoryProvider: () => F) {
    // Initialize registry if dynamic updates needed
  }

  /**
   * Registry Access
   */
  getDefinition(stepKey: StepKey): IStepDefinition<F> | undefined {
    return this.config.registry[stepKey];
  }

  /**
   * Navigation Logic
   */
  async next() {
    const { currentStep, sequence } = this.hive.honey;
    const currentIndex = sequence.indexOf(currentStep);

    // Check if last
    if (currentIndex >= sequence.length - 1) {
      // Flow Complete
      this.config.onFlowComplete?.(this.hive.honey.currentFlow, this.factoryProvider());
      return;
    }

    const nextStep = sequence[currentIndex + 1];

    // Validate Current Step
    const currentDef = this.getDefinition(currentStep);
    if (currentDef?.onNext) {
      this.hive.setHoney((prev) => ({ ...prev, status: "transitioning", error: undefined }));
      try {
        const canProceed = await currentDef.onNext(this.factoryProvider());
        if (canProceed === false) {
          this.hive.setHoney((prev) => ({ ...prev, status: "idle" }));
          return;
        }
      } catch (err) {
        this.hive.setHoney((prev) => ({ ...prev, status: "error", error: String(err) }));
        return;
      }
    }

    // Move
    this.goTo(nextStep, "forward");
  }

  async back() {
    const { history } = this.hive.honey;
    if (history.length === 0) return;

    const prevStep = history[history.length - 1];
    const newHistory = [...history];
    const target = newHistory.pop();

    if (target) {
      this.hive.setHoney((prev) => ({
        ...prev,
        currentStep: target,
        history: newHistory, // Removed target
        direction: "backward",
        status: "idle",
        error: undefined,
      }));
    }
  }

  async goTo(targetStep: StepKey, direction: "forward" | "backward" | "idle" = "idle") {
    const { currentStep, history, sequence } = this.hive.honey;

    // Validate target exists
    if (!this.config.registry[targetStep]) {
      console.error(`FlowSlice: Step ${targetStep} not found in registry`);
      return;
    }

    // Trigger onStepChange
    this.config.onStepChange?.(currentStep, targetStep, this.factoryProvider());

    // Update State
    const newHistory = direction === "forward" || direction === "idle" ? [...history, currentStep] : history;

    this.hive.setHoney((prev) => ({
      ...prev,
      currentStep: targetStep,
      history: direction === "backward" ? prev.history : [...prev.history, currentStep],
      direction,
      status: "idle",
      error: undefined,
    }));

    // OnEnter
    const targetDef = this.getDefinition(targetStep);
    targetDef?.onEnter?.(this.factoryProvider());
  }

  switchFlow(flowKey: FlowKey, startAtStep?: StepKey) {
    const sequence = this.config.flows[flowKey];
    if (!sequence) {
      console.error(`FlowSlice: Flow ${flowKey} not found`);
      return;
    }

    const firstStep = startAtStep || sequence[0];

    this.hive.setHoney({
      currentFlow: flowKey,
      currentStep: firstStep,
      sequence,
      history: [],
      direction: "idle",
      status: "idle",
    });
  }

  /**
   * API Construction
   */
  getAPI(): FlowAPI<StepKey, FlowKey, F> {
    return {
      hive: this.hive,
      next: () => this.next(),
      back: () => this.back(),
      goTo: (s) => this.goTo(s),
      switchFlow: (f, s) => this.switchFlow(f, s),
      isFirstStep: () => this.hive.honey.sequence[0] === this.hive.honey.currentStep,
      isLastStep: () => {
        const { sequence, currentStep } = this.hive.honey;
        return sequence[sequence.length - 1] === currentStep;
      },
      addStep: (key, def) => {
        this.config.registry[key] = def;
      },
      defineFlow: (key, seq) => {
        this.config.flows[key] = seq;
      },
      getDefinition: (key) => this.getDefinition(key),
    };
  }
}
