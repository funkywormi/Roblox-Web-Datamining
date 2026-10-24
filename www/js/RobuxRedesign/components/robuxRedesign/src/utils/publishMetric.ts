import { createWithApiMetrics } from "@rbx/payments/withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const publishMetric = createFireTelemetryCounter("BuyRobuxRedesign");
export const withApiMetrics = createWithApiMetrics(publishMetric);
