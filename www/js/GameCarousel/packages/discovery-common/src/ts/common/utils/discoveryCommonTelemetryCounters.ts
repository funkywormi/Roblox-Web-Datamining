import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const fireImageLoadFailTelemetryCounter = createFireTelemetryCounter(
  "DiscoveryCommonImageLoadFail",
);
