import { publishHistogram, publishMetric } from "../observability";

import type { ApiCallName } from "../observability";

const statusCodeFromError = (error: unknown): string => {
  if (error == null) {
    return "NetworkError";
  }
  if (typeof error === "object") {
    const { status, response, name, code } = error as {
      status?: unknown;
      response?: { status?: unknown };
      name?: unknown;
      code?: unknown;
    };
    if (typeof status === "number") {
      return status.toString();
    }
    if (typeof response?.status === "number") {
      return response.status.toString();
    }
    if (name === "FetchError") {
      return "NetworkError";
    }
    if (typeof code === "string") {
      return code;
    }
  }
  return "UnknownError";
};

export const withApiMetrics = async <T>(
  call: ApiCallName,
  request: () => Promise<T>,
): Promise<T> => {
  const metricName = `${call}_API`;
  const start = performance.now();
  publishMetric(metricName, { statusCode: "Throughput" });
  try {
    const result = await request();
    publishMetric(metricName, { statusCode: "200" });
    return result;
  } catch (error) {
    publishMetric(metricName, { statusCode: statusCodeFromError(error) });
    throw error;
  } finally {
    publishHistogram(`${metricName}_LatencyMs`, undefined, performance.now() - start);
  }
};
