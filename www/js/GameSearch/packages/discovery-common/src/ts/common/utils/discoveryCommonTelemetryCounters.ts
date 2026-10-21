import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const fireImageLoadFailTelemetryCounter = createFireTelemetryCounter(
  "DiscoveryCommonImageLoadFail",
);
