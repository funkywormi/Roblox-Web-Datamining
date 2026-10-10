import { isCancelled } from "@rbx/core-scripts/http";
import type { Attributes, FireTelemetryCounterFn } from "@rbx/web-telemetry/v2/fire";
import type { FireTelemetryHistogramFn } from "@rbx/web-telemetry/v2/histogram";

export const statusCodeFromError = (error: unknown): string => {
  if (error == null) {
    return "NetworkError";
  }
  if (isCancelled(error)) {
    return "Cancelled";
  }
  if (typeof error === "object") {
    const { status, code, response } = error as {
      status?: unknown;
      code?: unknown;
      response?: { status?: unknown };
    };
    if (typeof status === "number") {
      return status.toString();
    }
    // fullError rejections carry the response instead of being it.
    if (typeof response?.status === "number") {
      return response.status.toString();
    }
    if (typeof code === "string") {
      return code;
    }
  }
  return "UnknownError";
};

export const createWithApiMetrics =
  <Call extends string>({
    publishMetric,
    publishHistogram,
    getDimensions,
  }: {
    publishMetric: FireTelemetryCounterFn;
    publishHistogram: FireTelemetryHistogramFn;
    getDimensions: () => Attributes;
  }) =>
  async <T>(call: Call, request: () => Promise<T>): Promise<T> => {
    const metricName = `${call}_API`;
    const dimensions = getDimensions();
    const start = performance.now();
    publishMetric(metricName, { ...dimensions, statusCode: "Throughput" });
    try {
      const result = await request();
      publishMetric(metricName, { ...dimensions, statusCode: "200" });
      publishHistogram(`${metricName}_LatencyMs`, dimensions, performance.now() - start);
      return result;
    } catch (error) {
      const statusCode = statusCodeFromError(error);
      publishMetric(metricName, { ...dimensions, statusCode });
      if (statusCode !== "Cancelled") {
        publishHistogram(`${metricName}_LatencyMs`, dimensions, performance.now() - start);
      }
      throw error;
    }
  };
