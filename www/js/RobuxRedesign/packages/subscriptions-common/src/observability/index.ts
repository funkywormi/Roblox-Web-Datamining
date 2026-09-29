import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

import type { RegistryInput } from "@rbx/observability-framework/schema";

/** Do not rename `featureName`: `utils/trackCounter` publishes under the same prefix. */
export const observabilityRegistry = {
  featureName: "SubscriptionsCommon",
  team: "Economy > Payments & Fraud > Subscriptions",

  features: {
    billingPeriodSheet: {
      counters: [
        { name: "BillingPeriodSheetShown", dimensions: ["viewName", "termMonths"] },
        { name: "BillingPeriodOptionSelected", dimensions: ["viewName", "months"] },
        { name: "BillingPeriodSubscribeClick", dimensions: ["viewName", "months", "isFreeTrial"] },
        { name: "BillingPeriodSheetDismissed", dimensions: ["viewName", "months"] },
      ],
    },
  },
} as const satisfies RegistryInput;

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: createFireTelemetryCounter(observabilityRegistry.featureName),
});
