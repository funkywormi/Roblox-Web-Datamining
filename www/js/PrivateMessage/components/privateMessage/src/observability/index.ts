import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers, type PublishFn } from "@rbx/observability-framework/trackers";
import { window } from "@rbx/core-lib/browser";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import type { MessageTab } from "../types";

export const observabilityRegistry = {
  featureName: "PrivateMessage",
  team: "User > Communication > Communication Platform",
  // Matches .NET PageNameProvider.Messages and the Next.js route's pageName.
  internalPageName: "Messages",
  // LoadFailed ran at ~1.1% of page views until 2026-10-30 (now ~0.7%, with spikes past 1%), so
  // the 1% default would have fired daily; raised while that baseline is investigated.
  defaultAlerts: { health: { criticalErrors: { maxRatio: 0.02 } } },

  features: {
    health: {
      counters: [{ name: "PageView", dimensions: ["host", "tab"] }],
      criticalErrors: [{ name: "LoadFailed", dimensions: ["host", "tab", "statusCode"] }],
    },
    messages: {
      counters: [{ name: "OpenTab", dimensions: ["tab"] }, "OpenMessage"],
      errors: [
        { name: "MarkReadFailed", dimensions: ["statusCode"] },
        { name: "ArchiveFailed", dimensions: ["statusCode"] },
        { name: "RulesLoadFailed", dimensions: ["statusCode"] },
        { name: "NewsCountLoadFailed", dimensions: ["statusCode"] },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

// Same inlining as the HTTP transport switch; the Rspack SCS build leaves it undefined.
export const host = process.env.NEXT_PUBLIC_IS_NEXTJS === "true" ? "nextjs" : "dotnet";

const fireTelemetryCounter = createFireTelemetryCounter(observabilityRegistry.featureName);

// Browsers have no app type, so report `unknown`. Trim because core-scripts returns
// " universalApp" with a leading space.
const getAppType = (): string => {
  const appType = getDeviceMeta()?.appType.trim();
  return appType == null || appType === "" ? "unknown" : appType;
};

// `host` compares .NET with Next.js. `appType` lets us drop app webviews, which always get .NET
// and aren't in the experiment.
export const publishMetric: PublishFn = (name, dimensions) => {
  fireTelemetryCounter(name, { ...dimensions, host, appType: getAppType() });
};

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, featureName: observabilityRegistry.featureName },
);

const fireTelemetryHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

// False after a client-side navigation.
const isInitialPageLoad = (): boolean => {
  const [navigation] = performance.getEntriesByType("navigation");
  return (
    navigation !== undefined && new URL(navigation.name).pathname === window?.location.pathname
  );
};

let firstLoadSettled = false;

/**
 * Reports `ListLoadedMs`: time from opening the page until the message list is shown.
 * Call once when the first load finishes. Reports only if that load showed the list, so a later
 * tab switch is never timed from page open.
 */
export const trackFirstLoadSettled = (tab: MessageTab, listShown: boolean): void => {
  // Once per page load.
  if (firstLoadSettled || !isInitialPageLoad()) {
    return;
  }
  firstLoadSettled = true;
  if (listShown) {
    fireTelemetryHistogram("ListLoadedMs", { host, tab, appType: getAppType() }, performance.now());
  }
};
