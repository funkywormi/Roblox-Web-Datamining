import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { reportError } from "@rbx/core-scripts/sentry";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

/**
 * `featureName` is the counter series prefix. Do not rename it after dashboards exist.
 */
export const observabilityRegistry = {
  featureName: "Catalog",
  team: "Economy > Marketplace > Client Core",

  features: {
    health: {
      criticalErrors: ["CatalogPageReactCrash"],
    },
    search: {
      errors: ["SearchItemsFailed", "SearchHydrationFailed"],
    },
    hydration: {
      errors: ["ItemDetailsHydrationExhausted"],
    },
    itemDetails: {
      counters: ["PurchaseParamsLoadFailed"],
      criticalErrors: ["ItemDetailsPageLoadFailed"],
    },
    purchase: {
      counters: ["BuyClick"],
      errors: ["FacialAgeEstimationFailed"],
    },
    cart: {
      counters: ["AddToCart", "CartPurchaseSuccess", "CartPurchaseError"],
      errors: ["AddToCartFailed", "CartRefreshFailed", "CartItemHydrationFailed"],
    },
    resale: {
      errors: ["ResaleDataLoadFailed", "LimitedInventoryLoadFailed"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, captureException: reportError },
);
