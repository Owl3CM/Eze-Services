import { useHoney } from "../../../Hooks";
import { FlowAPI } from "./Types";

export type StepStatus = "passed" | "active" | "future";

export interface FlowStepInfo {
  key: string;
  label: string;
  index: number;
  status: StepStatus;
  isLast: boolean;
}

export function useFlowSteps<F>(factory: { flow: FlowAPI<any, any, F> }) {
  const { sequence, currentStep } = useHoney(factory.flow.hive);
  const currentIndex = sequence.indexOf(currentStep);

  const steps: FlowStepInfo[] = sequence.map((key: any, index: number) => {
    const def = factory.flow.getDefinition(key);
    const label = def?.label || key;

    let status: StepStatus = "future";
    if (index < currentIndex) status = "passed";
    else if (index === currentIndex) status = "active";

    return {
      key,
      label,
      index,
      status,
      isLast: index === sequence.length - 1,
    };
  });

  return {
    steps,
    currentStep,
    currentIndex,
    isFirst: currentIndex === 0,
    isLast: currentIndex === sequence.length - 1,
    goTo: factory.flow.goTo,
    next: factory.flow.next,
    back: factory.flow.back,
  };
}
