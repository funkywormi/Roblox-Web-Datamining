import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosError, UrlConfig } from "@rbx/core-scripts/http";
import type { FireTelemetryCounterFn } from "@rbx/web-telemetry/fire";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosError(error: any): error is AxiosError {
  return typeof error === "object" && "config" in error;
}

type EventCounterProps<C> = {
  call: C;
};

type CommonRequestConfig<C extends string = string> = {
  url: string;
  config?: Omit<UrlConfig, "url">;
  eventCounterProps: EventCounterProps<C>;
};

export type GETRequestConfig<C extends string = string> = CommonRequestConfig<C> & {
  method: "GET";
};

export type POSTRequestConfig<C extends string = string> = CommonRequestConfig<C> & {
  method: "POST";
  data: object;
};

type RequestData<C extends string = string> = GETRequestConfig<C> | POSTRequestConfig<C>;

export type WithApiMetricsFn<C extends string = string> = <T>(
  requestData: RequestData<C>,
) => Promise<T | undefined>;

export type WithApiMetricsV2Result<T> = {
  data: T;
  headers: Record<string, string>;
};

export type WithApiMetricsV2Fn<C extends string = string> = <T>(
  requestData: RequestData<C>,
) => Promise<WithApiMetricsV2Result<T>>;

type CaptureExceptionFn = (error: unknown, tags?: Record<string, string>) => void;

function statusCodeFromError(error: unknown): string {
  if (isAxiosError(error)) {
    return error.code ?? error?.response?.status.toString() ?? "UnknownAxiosError";
  }
  return "UnknownError";
}

/** Server errors (5xx), network failures, and non-HTTP errors are sent to Sentry. */
function shouldCaptureException(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  if (status === undefined) return true;
  return status >= 500;
}

export function createWithApiMetrics<C extends string = string>(
  publishMetric: FireTelemetryCounterFn,
): WithApiMetricsFn<C> {
  return async <T>(requestData: RequestData<C>) => {
    const { call } = requestData.eventCounterProps;
    const metricName = `${call}_API`;

    publishMetric(metricName, { statusCode: "Throughput" });

    try {
      const { data } = await (requestData.method === "GET"
        ? httpService.get<T>(
            { url: requestData.url, fullError: true, ...requestData.config },
            requestData.config?.params,
          )
        : httpService.post<T>(
            { url: requestData.url, fullError: true, ...requestData.config },
            requestData.data,
          ));

      publishMetric(metricName, { statusCode: "200" });
      return data;
    } catch (error) {
      let statusCode: string;

      if (isAxiosError(error)) {
        statusCode = error.code ?? error?.response?.status.toString() ?? "UnknownAxiosError";
      } else {
        statusCode = "UnknownError";
        console.error(error);
      }

      publishMetric(metricName, { statusCode });
      return undefined;
    }
  };
}

/**
 * Like `createWithApiMetrics`, but does not swallow failures: 5xx, network, and
 * non-HTTP errors are captured to Sentry and rethrown; expected 4xx responses are
 * rethrown without Sentry. Callers must handle errors (return a proper error
 * state / let them bubble), and the success value is `T` rather than
 * `T | undefined`. Throughput / status-code metrics are published identically.
 */
export function createWithApiMetricsV2<C extends string = string>(
  publishMetric: FireTelemetryCounterFn,
  captureException: CaptureExceptionFn,
): WithApiMetricsV2Fn<C> {
  return async <T>(requestData: RequestData<C>) => {
    const { call } = requestData.eventCounterProps;
    const metricName = `${call}_API`;

    publishMetric(metricName, { statusCode: "Throughput" });

    try {
      const { data, headers } = await (requestData.method === "GET"
        ? httpService.get<T>(
            { url: requestData.url, fullError: true, ...requestData.config },
            requestData.config?.params,
          )
        : httpService.post<T>(
            { url: requestData.url, fullError: true, ...requestData.config },
            requestData.data,
          ));

      publishMetric(metricName, { statusCode: "200" });
      return { data, headers };
    } catch (error) {
      const statusCode = statusCodeFromError(error);
      publishMetric(metricName, { statusCode });
      if (shouldCaptureException(error)) {
        captureException(error, { call, statusCode });
      }
      throw error;
    }
  };
}
