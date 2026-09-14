/**
 * Cross-surface trigger: any surface calls `startWizard(...)` (directly or via
 * `window.Roblox.AmpV2WizardService`); the singleton `WizardApp` listens for the event and renders
 * the flow, decoupling the modal's lifecycle from the caller's React tree. The event `detail` is
 * passed by reference (NOT serialized), so live objects/functions — `registry`, `config`, `api`,
 * `onEvent`, `closeCallback` — survive the hand-off.
 */

import type { FlowApi, FlowExitResult, FlowSelector, Registry, Target } from "../types";
import type { WalkerEvent } from "../hooks/useWizardWalker";

export const AmpV2WizardEvent = {
  StartWizard: "AmpV2Wizard.StartWizard",
} as const;

export type AmpV2WizardEventName = (typeof AmpV2WizardEvent)[keyof typeof AmpV2WizardEvent];

/** Everything the host needs to run one flow. `closeCallback` fires exactly once, on exit, resolving `startWizard`. */
export type StartWizardDetail = {
  target?: Target;
  flow?: FlowSelector;
  surface: string;
  extraProps?: Record<string, unknown>;
  /** Client-specific node wiring threaded to the host/nodes (e.g. a route a node navigates to). */
  config?: Record<string, unknown>;
  registry?: Registry;
  /** Injectable for tests/demo; the host defaults to the real HTTP provider when omitted. */
  api?: FlowApi;
  onEvent?: (event: WalkerEvent) => void;
  /**
   * Fired only when a flow actually ran and exited — not for an empty entry or a rejected concurrent
   * start. useAmpUpsell wires this to its availability re-probe.
   */
  onComplete?: (result: FlowExitResult) => void;
  closeCallback: (result: FlowExitResult) => void;
};

/** Caller-supplied params: the detail minus the internally-wired `closeCallback`. */
export type StartWizardParams = Omit<StartWizardDetail, "closeCallback">;

/**
 * Dispatches a StartWizard event and resolves (never rejects) with the exit result. If no host is
 * mounted the promise never settles — but surfaces only reach this after the host surface has loaded.
 */
export function startWizard(params: StartWizardParams): Promise<FlowExitResult> {
  return new Promise<FlowExitResult>(resolve => {
    const detail: StartWizardDetail = {
      ...params,
      closeCallback: (result: FlowExitResult) => {
        resolve(result);
      },
    };
    window.dispatchEvent(
      new CustomEvent<StartWizardDetail>(AmpV2WizardEvent.StartWizard, { detail }),
    );
  });
}

/** The object assigned to `window.Roblox.AmpV2WizardService` by the host surface's entry. */
export const ampV2WizardService = {
  AmpV2WizardEvent,
  startWizard,
};

export type AmpV2WizardServiceInterface = typeof ampV2WizardService;

declare global {
  interface WindowEventMap {
    // Types the StartWizard event so listeners receive a typed detail without an assertion.
    "AmpV2Wizard.StartWizard": CustomEvent<StartWizardDetail>;
  }
}
