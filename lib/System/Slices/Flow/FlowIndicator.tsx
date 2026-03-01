import React, { ReactNode } from "react";
import { FlowAPI } from "./Types";
import { useFlowSteps, FlowStepInfo } from "./useFlowSteps";
import "./stepper.css";

// ═══════════════════════════════════════════════════════
// ── Types ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════

export interface FlowIndicatorProps<F = any> {
  factory: F & { flow: FlowAPI<any, any, F> };

  /** Full custom render (headless mode). */
  children?: (data: { steps: FlowStepInfo[]; currentStep: string; goTo: (s: string) => void }) => ReactNode;

  /** Custom render for individual steps. */
  renderStep?: (props: FlowStepInfo & { onClick: () => void }) => ReactNode;

  className?: string;
  style?: React.CSSProperties;
  gap?: number | string;
}

// ═══════════════════════════════════════════════════════
// ── Component ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════

export function FlowIndicator<F = any>({ factory, children, renderStep, className, style, gap = 40 }: FlowIndicatorProps<F>) {
  const { steps, currentStep, goTo, currentIndex } = useFlowSteps(factory);

  // 1. Headless mode
  if (children && typeof children === "function") {
    return <>{children({ steps, currentStep, goTo })}</>;
  }

  // 2. Default render
  const percentage = steps.length > 2 ? 100 : 120;
  const lineW = (currentIndex / steps.length) * percentage;

  return (
    <div
      className={`ez-stepper ${className || ""}`}
      style={
        {
          gap,
          "--stepper-line-w": `${lineW}%`,
          ...style,
        } as React.CSSProperties
      }>
      {steps.map((step) => {
        const handleClick = () => {
          if (step.index <= currentIndex) goTo(step.key);
        };

        if (renderStep) {
          return <React.Fragment key={step.key}>{renderStep({ ...step, onClick: handleClick })}</React.Fragment>;
        }

        return (
          <div key={step.key} className="ez-stepper__step" data-status={step.status} onClick={handleClick}>
            <span className="ez-stepper__number">{step.index + 1}</span>
            <span className="ez-stepper__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
