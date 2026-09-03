import { createWithApiMetrics } from "@rbx/payments/withApiMetrics";
import { createWithTtiMetrics } from "@rbx/payments/withTtiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const { reportInteractive } = createWithTtiMetrics("BuyRobux_WebView_TTI");
export const publishMetric = createFireTelemetryCounter("BuyRobuxRedesign");
export const withApiMetrics = createWithApiMetrics(publishMetric);
