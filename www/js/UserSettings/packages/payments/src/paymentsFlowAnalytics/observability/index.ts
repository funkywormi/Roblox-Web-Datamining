import type { RegistryInput } from "@rbx/observability-framework/schema";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { captureException } from "../../error";

export const observabilityRegistry = {
  featureName: "PaymentsFlowAnalytics",
  team: "Economy > Payments & Fraud",

  features: {
    PaymentFlow: {
      counters: ["UserPaymentFlowMidPurchaseStepTriggeredWithoutCtx", "UserPaymentFlowFlowEnded"],
      errors: [
        "UserPaymentFlowWrongUsageOfMethod",
        "UserPaymentFlowSendEventWithoutUuidOrCtx",
        "UserPaymentFlowLoadPreExistingCtxError",
        "UserPaymentFlowSendStatusEventError",
        "UserPaymentFlowSendUserEventError",
        "UserPaymentFlowStartFlowError",
        "UserPaymentFlowFlowEndedWithoutTriggerContext",
      ],
    },
  },
} as const satisfies RegistryInput;

const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
