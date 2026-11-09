import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createAppShellTracker } from "./host";
import { observabilityRegistry } from "./index";

/** Sends App Shell counters from .NET pages. */
export const trackDotnetAppShellCounter = createAppShellTracker(
  observabilityRegistry,
  createFireTelemetryCounter(observabilityRegistry.featureName),
  "dotnet",
);
