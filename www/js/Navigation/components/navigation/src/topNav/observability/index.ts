import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureException as captureSentryException } from "@rbx/core-scripts/sentry";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isAuthenticated } from "@rbx/core-scripts/meta/user";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import type { AppShellHost } from "@rbx/www-common/observability/app-shell/host";
import { createWithApiMetrics } from "../../util/apiMetrics";
import { getWasHidden, logTimingDebug, watchHiddenFromNow } from "../../util/pageVisibility";

export const observabilityRegistry = {
  featureName: "TopNav",
  team: "User > Consumer Apps > Platforms - Web & Backend",
  defaultTimeCompare: { mode: "offset", offset: "7d" },
  features: {
    health: {
      counters: [{ name: "Rendered", dimensions: ["variant", "authState", "deviceType", "host"] }],
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

const captureException = (error: unknown, context?: Record<string, string>) => {
  console.error(error, context);

  if (!context) {
    captureSentryException(error);
    return;
  }

  const { error_counter: errorCounter, ...extra } = context;
  captureSentryException(error, {
    ...(errorCounter != null ? { tags: { error_counter: errorCounter } } : {}),
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  });
};

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const TopNavErrorBoundary = createObsErrorBoundary(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

// The side that rendered the page, so TopNav metrics can compare Next.js with .NET. The .NET bundle
// keeps the default; the Next.js entry sets it.
let host: AppShellHost = "dotnet";

export const setTopNavHost = (value: AppShellHost): void => {
  host = value;
};

export const getDimensions = () => ({
  variant: "FOUNDATION",
  authState: isAuthenticated() ? "LOGGED_IN" : "LOGGED_OUT",
  deviceType: getDeviceMeta()?.deviceType || "unknown",
  host,
});

export const trackRendered = (): void => {
  const dimensions = getDimensions();
  trackCounter("Rendered", dimensions);
  const renderedMs = performance.now();
  const timingDimensions = { ...dimensions, wasHidden: getWasHidden() };
  publishHistogram("RenderedMs", timingDimensions, renderedMs);
  logTimingDebug("TopNav_RenderedMs", renderedMs, timingDimensions);
};

export const trackOpenToVisible = (menu: "Settings" | "Notifications"): void => {
  const start = performance.now();
  const wasHiddenSinceStart = watchHiddenFromNow();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const ms = performance.now() - start;
      const dimensions = { ...getDimensions(), wasHidden: wasHiddenSinceStart() };
      publishHistogram(`${menu}OpenToVisibleMs`, dimensions, ms);
      logTimingDebug(`TopNav_${menu}OpenToVisibleMs`, ms, dimensions);
    });
  });
};

export const withApiMetrics = createWithApiMetrics<ApiCallName>({
  publishMetric,
  publishHistogram,
  getDimensions,
});
