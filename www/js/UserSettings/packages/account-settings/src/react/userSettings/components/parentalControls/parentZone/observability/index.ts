import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

/**
 * `featureName` is the counter series prefix. Do not rename it after dashboards exist.
 */
export const observabilityRegistry = {
  featureName: "OnDeviceParentalControlsZone",
  team: "Safety > Accounts",
  features: {
    parentZone: {
      counters: [
        "LandingPageShown",
        { name: "PageShown", dimensions: ["page"] },
        { name: "SettingsPageLoadFailed", dimensions: ["page"] },
        { name: "WizardActionStarted", dimensions: ["requestType"] },
        { name: "WizardActionCompleted", dimensions: ["requestType"] },
        { name: "WizardActionCancelled", dimensions: ["requestType"] },
        { name: "WizardActionFailed", dimensions: ["requestType"] },
      ],
      flows: [
        {
          id: "odp_parent_zone_pages",
          title: "Parent zone pages",
          steps: [
            { counter: "PageShown", role: "start", title: "Page shown" },
            { counter: "SettingsPageLoadFailed", role: "error", title: "Load failed" },
          ],
        },
        {
          id: "odp_parent_zone_action",
          title: "Parent zone action (through the ODP wizard)",
          steps: [
            { counter: "WizardActionStarted", role: "start", title: "Started" },
            {
              counter: "WizardActionCompleted",
              role: "success",
              title: "Completed",
            },
            { counter: "WizardActionCancelled", role: "drop", title: "Cancelled" },
            { counter: "WizardActionFailed", role: "error", title: "Failed" },
          ],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
