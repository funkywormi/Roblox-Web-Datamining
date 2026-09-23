import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

const publishMetric = createFireTelemetryCounter("SubscriptionsCommon");

export function trackCounter(metricName: string, dimensions?: Record<string, string>): void {
  publishMetric(metricName, dimensions);
}
