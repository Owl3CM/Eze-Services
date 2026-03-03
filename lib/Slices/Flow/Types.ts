import { IHive } from "../../Hives";
import { ReactNode } from "react";

// ============================================================================
// Flow Definitions
// ============================================================================

/**
 * Definition of a single step.
 * Generic F represents the Factory Type.
 */
export interface IStepDefinition<F = any> {
  label: string;
  /**
   * Components receive the factory instance to access other slices (Form, Status, etc.)
   */
  component: (props: { factory: F }) => ReactNode;

  /**
   * Called when trying to move to the next step.
   * Return false or throw to block navigation.
   */
  onNext?: (factory: F) => Promise<boolean | void>;

  /**
   * Called when the step becomes active.
   */
  onEnter?: (factory: F) => void;

  /**
   * Custom metadata (e.g. icons, progress info)
   */
  meta?: Record<string, any>;
}

// ============================================================================
// Flow Configuration
// ============================================================================

export interface FlowSliceConfig<F, StepKey extends string, FlowKey extends string> {
  /**
   * Dictionary of all available steps.
   */
  registry: Record<StepKey, IStepDefinition<F>>;

  /**
   * Dictionary of named flows (ordered lists of step keys).
   */
  flows: Record<FlowKey, StepKey[]>;

  /**
   * The default flow to start with.
   */
  defaultFlow: FlowKey;

  // Events
  onStepChange?: (from: StepKey, to: StepKey, factory: F) => void;
  onFlowComplete?: (flow: FlowKey, factory: F) => void;
}

// ============================================================================
// Flow State
// ============================================================================

export interface FlowState<StepKey extends string = string, FlowKey extends string = string> {
  currentFlow: FlowKey;
  currentStep: StepKey;

  /**
   * The sequence of steps for the current flow.
   */
  sequence: StepKey[];

  /**
   * Stack of visited steps.
   */
  history: StepKey[];

  direction: "forward" | "backward" | "idle";

  /**
   * Status of the flow transition
   */
  status: "idle" | "transitioning" | "error";

  /**
   * Error message if transition failed
   */
  error?: string;
}

// ============================================================================
// Flow API
// ============================================================================

export interface FlowAPI<StepKey extends string = string, FlowKey extends string = string, F = any> {
  hive: IHive<FlowState<StepKey, FlowKey>>;

  // Navigation
  next: () => Promise<void>;
  back: () => Promise<void>;
  goTo: (step: StepKey) => Promise<void>;

  // Flow Management
  switchFlow: (flow: FlowKey, startAtStep?: StepKey) => void;

  // Queries
  isLastStep: () => boolean;
  isFirstStep: () => boolean;

  // Dynamic Management
  addStep: (key: StepKey, def: IStepDefinition<F>) => void;
  defineFlow: (flowKey: FlowKey, sequence: StepKey[]) => void;
  getDefinition: (stepKey: StepKey) => IStepDefinition<F> | undefined;
}

// ============================================================================
// Dependencies
// ============================================================================

export interface FlowDependencies {
  // Can depend on StatusSlice for loading states
  // But purely optional, as logic handles it internally or via Factory injection
}
