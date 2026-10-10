import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { reportError } from "@rbx/core-scripts/sentry";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import { createWithApiMetrics } from "../../util/apiMetrics";

export const observabilityRegistry = {
  featureName: "LeftNav",
  team: "User > Consumer Apps > Platforms - Web & Backend",
  defaultTimeCompare: { mode: "offset", offset: "7d" },
  features: {
    health: {
      counters: [{ name: "Rendered", dimensions: ["variant", "deviceType"] }],
      criticalErrors: ["LeftNavReactCrash"],
    },
    arm: {
      counters: [{ name: "VariantSwapped", dimensions: ["from", "to", "cache", "deviceType"] }],
      errors: [{ name: "IxpFetchFailed", dimensions: ["cachedVariant", "deviceType"] }],
    },
    counts: {
      apiCalls: ["FriendRequestCount", "MessageUnreadCount", "TradeInboundCount"],
    },
  },
} as const satisfies RegistryInput;

export type ApiCallName = MakeObservabilityTypes<typeof observabilityRegistry>["ApiCall"];
export type Variant = "NEW" | "OLD";

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const publishHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

const captureException = (error: unknown, tags?: Record<string, string>) => {
  reportError(error, tags);
};

export const { trackCounter, trackError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const LeftNavErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const getDeviceType = (): string => getDeviceMeta()?.deviceType || "unknown";

export const trackOpenToVisible = (variant: Variant): void => {
  const start = performance.now();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      publishHistogram(
        "OpenToVisibleMs",
        { variant, deviceType: getDeviceType() },
        performance.now() - start,
      );
    });
  });
};

export const withApiMetrics = createWithApiMetrics<ApiCallName>({
  publishMetric,
  publishHistogram,
  getDimensions: () => ({ deviceType: getDeviceType() }),
});
