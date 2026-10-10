import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";

import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";

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
    plusReferrals: {
      apiCalls: ["SenderReferralEligibility", "PendingPlusReferrals", "PlusSubscriberAccess"],
    },
  },
} as const satisfies RegistryInput;

export type ApiCallName = MakeObservabilityTypes<typeof observabilityRegistry>["ApiCall"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const publishHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
