import type { CounterName } from ".";

/** Real-time counter names for the on-device parent zone, checked against the registry. */
export const ParentZoneCounter = {
  LandingPageShown: "LandingPageShown",
  PageShown: "PageShown",
  SettingsPageLoadFailed: "SettingsPageLoadFailed",
  WizardActionStarted: "WizardActionStarted",
  WizardActionCompleted: "WizardActionCompleted",
  WizardActionCancelled: "WizardActionCancelled",
  WizardActionFailed: "WizardActionFailed",
} as const satisfies Record<string, CounterName>;
