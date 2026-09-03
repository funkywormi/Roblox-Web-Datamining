import type { Url } from "@rbx/core-lib/url";

import {
  buildSduiPageEventDescriptor,
  SDUI_PAGE_PAYLOAD_SIZE_EVENT_NAME,
  SDUI_PAGE_STATUS_EVENT_NAME,
} from "../analytics/pageAnalyticsDescriptors";
import { reportError, SduiErrorName } from "../errors";
import { decodeSduiFetchResponse } from "../proto/decodeResponse";
import { classifyFetchError, type SduiPageStatusCode } from "../transport/classifyFetchError";
import {
  buildRequestSignal,
  DEFAULT_SDUI_REQUEST_TIMEOUT_MS,
} from "../transport/sduiRequestSignal";
import { sduiFetch } from "../transport/sduiTransport";
import type {
  ApiRequestConfig,
  SduiAnalyticsReporter,
  SduiApiResponse,
  SduiErrorReporter,
} from "../types";
import type { SduiLoadTimer } from "../types/performance";
import { getConfigKey } from "../utils/apiStoreHelper";
import { toError } from "../utils/error";

interface SduiRequestExecutorDeps {
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
}

interface ExecuteSduiRequestOptions {
  loadTimer: SduiLoadTimer;
  isRequestCurrent: () => boolean;
  reportPageAnalytics: boolean;
  invalidationSignal?: AbortSignal;
}

function emitPageStatusEvent(
  analyticsReporter: SduiAnalyticsReporter,
  requestConfig: ApiRequestConfig,
  statusCode: SduiPageStatusCode,
  httpError?: string,
): void {
  analyticsReporter.logEvent(
    buildSduiPageEventDescriptor(SDUI_PAGE_STATUS_EVENT_NAME, requestConfig.pageContext),
    {
      pageKey: requestConfig.surfaceKey,
      statusCode,
      ...(httpError != null ? { httpError } : {}),
    },
  );
}

function emitPagePayloadSizeEvent(
  analyticsReporter: SduiAnalyticsReporter,
  requestConfig: ApiRequestConfig,
  response: Response,
): void {
  const headerValue = response.headers.get("Content-Length");
  const payloadSize = headerValue == null ? NaN : Number(headerValue);
  if (!Number.isFinite(payloadSize)) return;
  analyticsReporter.logEvent(
    buildSduiPageEventDescriptor(SDUI_PAGE_PAYLOAD_SIZE_EVENT_NAME, requestConfig.pageContext),
    { pageKey: requestConfig.surfaceKey, payloadSize },
  );
}

export function createSduiRequestExecutor(deps: SduiRequestExecutorDeps) {
  return async function executeSduiRequest(
    requestConfig: ApiRequestConfig,
    url: Url,
    options: ExecuteSduiRequestOptions,
  ): Promise<SduiApiResponse> {
    const { loadTimer, isRequestCurrent, reportPageAnalytics, invalidationSignal } = options;
    const useProtobuf = (requestConfig.responseFormat ?? "json") === "protobuf";
    const headers: Record<string, string> = {
      Accept: useProtobuf ? "application/x-protobuf" : "application/json",
      ...requestConfig.headers,
    };
    const configKey = getConfigKey(requestConfig);
    const { pageContext } = requestConfig;

    // TODO(lua-parity): postConfig — POST body + Content-Type. Requires
    // sduiFetch to accept method/body. See lua `SduiApiStorePostConfig`.
    const timeoutMs = requestConfig.timeoutMs ?? DEFAULT_SDUI_REQUEST_TIMEOUT_MS;
    const callerSignals = [requestConfig.signal, invalidationSignal].filter(
      (signal): signal is AbortSignal => signal !== undefined,
    );
    const { signal: requestSignal, cleanup: cleanupRequestSignal } = buildRequestSignal(
      timeoutMs,
      callerSignals,
    );

    loadTimer.logUiRequestSent();

    try {
      const fetchResult = await sduiFetch(url, headers, { signal: requestSignal });

      if (isRequestCurrent()) {
        loadTimer.logUiResponseReceived();
      }

      if (fetchResult.isErr()) {
        const { error } = fetchResult;
        const { errorName, statusCode, message } = classifyFetchError(error, { timeoutMs });
        if (isRequestCurrent()) {
          loadTimer.updateRequestStatus("FailedToLoad");
          if (reportPageAnalytics) {
            emitPageStatusEvent(deps.analyticsReporter, requestConfig, statusCode, error.name);
          }
          reportError(errorName, message, pageContext, { name: configKey }, deps.errorReporter);
        }
        throw error;
      }
      const httpResponse = fetchResult.value;

      if (isRequestCurrent()) {
        loadTimer.updateRequestStatus("LoadedFromNetwork");
        if (reportPageAnalytics) {
          emitPageStatusEvent(deps.analyticsReporter, requestConfig, httpResponse.status);
          if (httpResponse.ok) {
            emitPagePayloadSizeEvent(deps.analyticsReporter, requestConfig, httpResponse);
          }
        }
      }

      if (isRequestCurrent()) {
        loadTimer.logResponseDecodeBegin();
      }
      try {
        const decoded = await decodeSduiFetchResponse(httpResponse, requestConfig, requestSignal);
        if (requestSignal.aborted) {
          throw requestSignal.reason ?? new DOMException("The operation was aborted", "AbortError");
        }
        if (isRequestCurrent()) {
          loadTimer.logResponseDecodeEnd();
        }
        return decoded;
      } catch (error) {
        if (isRequestCurrent()) {
          loadTimer.logResponseDecodeEnd();
          loadTimer.updateRequestStatus("FailedToLoad");
          if (requestSignal.aborted) {
            const abortReason: unknown = requestSignal.reason;
            const timedOut =
              abortReason instanceof DOMException && abortReason.name === "TimeoutError";
            const errorName = timedOut
              ? SduiErrorName.SduiRequestTimedOut
              : SduiErrorName.SduiRequestAborted;
            const statusCode = timedOut ? "timeout" : "aborted";
            const abortError = toError(abortReason ?? error);
            if (reportPageAnalytics) {
              emitPageStatusEvent(
                deps.analyticsReporter,
                requestConfig,
                statusCode,
                abortError.name,
              );
            }
            reportError(
              errorName,
              abortError.message,
              pageContext,
              { name: configKey },
              deps.errorReporter,
            );
          } else {
            reportError(
              SduiErrorName.FailedToDecodeResponse,
              error instanceof Error ? error.message : String(error),
              pageContext,
              { name: configKey },
              deps.errorReporter,
            );
          }
        }
        throw error;
      }
    } finally {
      cleanupRequestSignal();
    }
  };
}
