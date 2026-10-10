import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { reportError } from "@rbx/core-scripts/sentry";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isAuthenticated } from "@rbx/core-scripts/meta/user";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import { createWithApiMetrics } from "../../util/apiMetrics";
import { getIsTopNavFoundationEnabled } from "../../util/topNavFoundationIxp";

export const observabilityRegistry = {
  featureName: "TopNav",
  team: "User > Consumer Apps > Platforms - Web & Backend",
  defaultTimeCompare: { mode: "offset", offset: "7d" },
  features: {
    health: {
      counters: [{ name: "Rendered", dimensions: ["variant", "authState", "deviceType"] }],
      criticalErrors: ["RightHeaderCrash", "RobuxCrash", "MenuIconCrash", "AgeBadgeCrash"],
    },
    header: {
      apiCalls: ["UserCurrency", "CreditBalance", "RobuxBadge", "HeaderGuac", "VngShopUrl"],
    },
    notifications: {
      apiCalls: ["NotificationUnreadCount", "NotificationClearUnread"],
    },
    search: {
      apiCalls: ["AvatarAutocomplete", "GamesAutocomplete"],
    },
    account: {
      apiCalls: ["Logout", "SignupCompliance"],
    },
  },
} as const satisfies RegistryInput;

export type ApiCallName = MakeObservabilityTypes<typeof observabilityRegistry>["ApiCall"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const publishHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

const captureException = (error: unknown, tags?: Record<string, string>) => {
  reportError(error, tags);
};

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const TopNavErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const getDimensions = () => ({
  variant: getIsTopNavFoundationEnabled() ? "FOUNDATION" : "CORE_UI",
  authState: isAuthenticated() ? "LOGGED_IN" : "LOGGED_OUT",
  deviceType: getDeviceMeta()?.deviceType || "unknown",
});

export const trackRendered = (): void => {
  const dimensions = getDimensions();
  trackCounter("Rendered", dimensions);
  publishHistogram("RenderedMs", dimensions, performance.now());
};

export const trackOpenToVisible = (menu: "Settings" | "Notifications"): void => {
  const start = performance.now();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      publishHistogram(`${menu}OpenToVisibleMs`, getDimensions(), performance.now() - start);
    });
  });
};

export const withApiMetrics = createWithApiMetrics<ApiCallName>({
  publishMetric,
  publishHistogram,
  getDimensions,
});
