import React, { ReactNode, useEffect, useState } from "react";
import { useHoney } from "../../Hooks";
import { FlowAPI, IStepDefinition } from "../../Slices/Flow/Types";
import "./flow-view.css";

interface FlowViewProps<F = any> {
  factory: F & { flow: FlowAPI<any, any, F> };
  registry?: Record<string, IStepDefinition<F>>;
  className?: string;
  children?: ReactNode;
  animation?:
    | "slide"
    | "slide-simple"
    | "fade"
    | "scale"
    | "ios-push"
    | "blur"
    | "flip"
    | "lift"
    | "morph-overlay"
    | "circle-reveal"
    | "3d-cube"
    | "glitch"
    | "fold"
    | "none";
  customAnimations?: {
    enterNext?: string;
    leaveNext?: string;
    enterPrev?: string;
    leavePrev?: string;
  };
  duration?: number;
  [key: string]: any;
}

export function FlowView<F = any>({ factory, registry, className, animation = "slide", customAnimations, duration = 500, ...props }: FlowViewProps<F>) {
  const { currentStep } = useHoney(factory.flow.hive);

  const [state, setState] = useState({
    prevStep: null as string | null,
    currStep: currentStep,
    direction: "none",
    animating: false,
    transitionId: 0, // Used to force unique keys on every transition
  });

  const getStepIndex = (key: string) => {
    const sequence = factory.flow.hive.honey.sequence;
    if (sequence) return sequence.indexOf(key);
    return -1;
  };

  useEffect(() => {
    if (currentStep !== state.currStep) {
      const prevIndex = getStepIndex(state.currStep);
      const newIndex = getStepIndex(currentStep);

      let dir = "next";
      if (prevIndex !== -1 && newIndex !== -1) {
        dir = newIndex > prevIndex ? "next" : "prev";
      }

      setState((prev) => ({
        prevStep: prev.currStep,
        currStep: currentStep,
        direction: dir,
        animating: true,
        transitionId: prev.transitionId + 1,
      }));

      // FIX: If animation is "none", use 0 duration to prevent delay.
      const effectiveDuration = animation === "none" ? 0 : duration;

      const timer = setTimeout(() => {
        setState((s) => ({
          ...s,
          prevStep: null,
          animating: false,
        }));
      }, effectiveDuration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, animation, duration]); // Added animation and duration to deps

  const currentDef = factory.flow.getDefinition(state.currStep) || registry?.[state.currStep];
  const prevDef = state.prevStep ? factory.flow.getDefinition(state.prevStep) || registry?.[state.prevStep] : null;

  const CurrentComp = currentDef?.component;
  const PrevComp = prevDef?.component;

  const getAnimationClass = (role: "enter" | "leave", dir: string) => {
    if (customAnimations) {
      const key = (role + dir.charAt(0).toUpperCase() + dir.slice(1)) as keyof typeof customAnimations;
      if (customAnimations[key]) return customAnimations[key];
    }
    return "";
  };

  if (!CurrentComp) return null;

  // FIX: If animation is none, pass 0s to CSS as well
  const cssTime = animation === "none" ? "0s" : `${duration / 1000}s`;

  return (
    <div
      className={`ez-flow-view ${className || ""}`}
      style={{
        ["--time" as any]: cssTime,
        ...props.style,
      }}
      data-animation={animation}
      {...props}>
      {/* Previous Step (Leaving) */}
      {state.animating && state.prevStep && PrevComp && (
        <div
          // Append transitionId to key to force complete DOM replacement
          key={`${state.prevStep}-leaving-${state.transitionId}`}
          className={`ez-flow-step ${getAnimationClass("leave", state.direction)}`}
          data-transitional-stage={`${state.direction}-leaving`}>
          <PrevComp factory={factory} />
        </div>
      )}

      {/* Current Step (Entering/Active) */}
      <div
        // Append transitionId to key to force complete DOM replacement
        key={`${state.currStep}-entering-${state.transitionId}`}
        className={`ez-flow-step ${state.animating ? getAnimationClass("enter", state.direction) : ""}`}
        data-transitional-stage={state.animating ? `${state.direction}-entering` : ""}>
        <CurrentComp factory={factory} />
      </div>
    </div>
  );
}
