import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { appShellRegistry, publishWithHost } from "./appShell";

/** Sends App Shell counters from .NET pages. */
export const { trackCounter: trackDotnetAppShellCounter } = createTrackers(appShellRegistry, {
  publish: publishWithHost(createFireTelemetryCounter(appShellRegistry.featureName), "dotnet"),
  featureName: appShellRegistry.featureName,
});
