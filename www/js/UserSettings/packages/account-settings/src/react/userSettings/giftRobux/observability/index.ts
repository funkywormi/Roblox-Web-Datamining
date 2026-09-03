import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const observabilityRegistry = {
  featureName: "GiftRobux",
  team: "Economy > Payments & Fraud",
  features: {
    health: {
      counters: ["SheetOpened"],
    },
    checkout: {
      counters: [
        "SheetClosed",
        "ProductsLoadStarted",
        "ProductsLoadSuccess",
        { name: "ProductsLoadFailed", dimensions: ["failureType"] },
        "PrepareCheckoutStarted",
        "PrepareCheckoutSuccess",
        { name: "PrepareCheckoutFailed", dimensions: ["failureType"] },
        "CheckoutRedirect",
      ],
      errors: ["AddRobuxSheetRenderError", "RobuxBalanceSectionRenderError"],
      flows: [
        {
          id: "gift_robux_sheet",
          title: "Gift Robux sheet",
          steps: [
            { counter: "SheetOpened", role: "start", title: "Opened" },
            { counter: "CheckoutRedirect", role: "success", title: "Checkout redirect" },
            { counter: "SheetClosed", role: "drop", title: "Closed" },
          ],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];
export type DimensionsFor<N extends CounterName | ErrorName | CriticalErrorName> =
  Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
