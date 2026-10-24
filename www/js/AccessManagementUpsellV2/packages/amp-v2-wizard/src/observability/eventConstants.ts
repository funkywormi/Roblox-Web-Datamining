import type { CounterName } from ".";

/** Real-time counter names for the UFO wizard, checked against the registry. */
export const WizardCounter = {
  EntryRequested: "EntryRequested",
  EntryRejectedBusy: "EntryRejectedBusy",
  EntryNothingToRun: "EntryNothingToRun",
  EntryFailed: "EntryFailed",
  FlowStarted: "FlowStarted",
  NodeShown: "NodeShown",
  ContinueFailed: "ContinueFailed",
  UnrenderableNode: "UnrenderableNode",
  FlowCompleted: "FlowCompleted",
  FlowCancelled: "FlowCancelled",
  FlowErrored: "FlowErrored",
} as const satisfies Record<string, CounterName>;
