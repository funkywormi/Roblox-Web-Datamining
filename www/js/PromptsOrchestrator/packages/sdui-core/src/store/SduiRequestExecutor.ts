import type { Url } from "@rbx/core-lib/url";

import {
  buildSduiPageEventDescriptor,
  SDUI_PAGE_PAYLOAD_SIZE_EVENT_NAME,
  SDUI_PAGE_STATUS_EVENT_NAME,
} from "../analytics/pageAnalyticsDescriptors";
import { reportError, SduiErrorName } from "../errors";
import { decodeProtobufResponse, decodeSduiFetchResponse } from "../proto/decodeResponse";
import { classifyFetchError, type SduiPageStatusCode } from "../transport/classifyFetchError";
import {
  createSduiFrameBuilder,
  isSduiFrameProcessingError,
} from "../transport/createSduiFrameBuilder";
import {
  buildRequestSignal,
  DEFAULT_SDUI_REQUEST_TIMEOUT_MS,
} from "../transport/sduiRequestSignal";
import { sduiFetch, type SduiFetchOptions } from "../transport/sduiTransport";
import type {
  ApiRequestConfig,
  SduiAnalyticsReporter,
  SduiApiResponse,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import type { SduiLoadTimer } from "../types/performance";
import { getConfigKey } from "../utils/apiStoreHelper";
import { toError } from "../utils/error";

interface SduiRequestExecutorDeps {
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
}

interface ExecuteSduiRequestOptions {
  loadTimer: SduiLoadTimer;
  isRequestCurrent: () => boolean;
  reportPageAnalytics: boolean;
  invalidationSignal?: AbortSignal;
}

interface ReportResponseErrorContext {
  deps: SduiRequestExecutorDeps;
  requestConfig: ApiRequestConfig;
  loadTimer: SduiLoadTimer;
  isRequestCurrent: () => boolean;
  reportPageAnalytics: boolean;
  requestSignal: AbortSignal;
}

class SduiStreamDecodeError extends Error {
  constructor(error: unknown) {
    const cause = toError(error);
    super(cause.message, { cause });
    this.name = cause.name;
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (!signal.aborted) return;
  throw signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function emitPageStatusEvent(
  analyticsReporter: SduiAnalyticsReporter,
  pageContext: SduiPageContext,
  requestConfig: ApiRequestConfig,
  statusCode: SduiPageStatusCode,
  httpError?: string,
): void {
  analyticsReporter.logEvent(
    buildSduiPageEventDescriptor(SDUI_PAGE_STATUS_EVENT_NAME, pageContext),
    {
      pageKey: requestConfig.surfaceKey,
      statusCode,
      ...(httpError != null ? { httpError } : {}),
    },
  );
}

function emitPagePayloadSizeEvent(
  analyticsReporter: SduiAnalyticsReporter,
  pageContext: SduiPageContext,
  requestConfig: ApiRequestConfig,
  response: Response,
): void {
  const headerValue = response.headers.get("Content-Length");
  const payloadSize = headerValue == null ? NaN : Number(headerValue);
  if (!Number.isFinite(payloadSize)) return;
  analyticsReporter.logEvent(
    buildSduiPageEventDescriptor(SDUI_PAGE_PAYLOAD_SIZE_EVENT_NAME, pageContext),
    { pageKey: requestConfig.surfaceKey, payloadSize },
  );
}

function reportResponseError(
  context: ReportResponseErrorContext,
  error: unknown,
  fallbackErrorName: SduiErrorName.FailedToDecodeResponse | SduiErrorName.FailedToFetchPage,
): void {
  const { deps, requestConfig, loadTimer, isRequestCurrent, reportPageAnalytics, requestSignal } =
    context;
  if (!isRequestCurrent()) return;

  const configKey = getConfigKey(requestConfig);
  const { pageContext } = deps;
  loadTimer.updateRequestStatus("FailedToLoad");
  if (requestSignal.aborted) {
    const abortReason: unknown = requestSignal.reason;
    const timedOut = abortReason instanceof DOMException && abortReason.name === "TimeoutError";
    const errorName = timedOut
      ? SduiErrorName.SduiRequestTimedOut
      : SduiErrorName.SduiRequestAborted;
    const statusCode = timedOut ? "timeout" : "aborted";
    const abortError = toError(abortReason ?? error);
    if (reportPageAnalytics) {
      emitPageStatusEvent(
        deps.analyticsReporter,
        pageContext,
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
    return;
  }

  reportError(
    fallbackErrorName,
    error instanceof Error ? error.message : String(error),
    pageContext,
    { name: configKey },
    deps.errorReporter,
  );
}

async function decodeBufferedResponse(
  response: Response,
  context: ReportResponseErrorContext,
): Promise<SduiApiResponse> {
  const { requestConfig, loadTimer, isRequestCurrent, requestSignal } = context;
  if (isRequestCurrent()) {
    loadTimer.logResponseDecodeBegin();
  }

  try {
    const decoded = await decodeSduiFetchResponse(response, requestConfig, requestSignal);
    throwIfAborted(requestSignal);
    if (isRequestCurrent()) {
      loadTimer.logResponseDecodeEnd();
    }
    return decoded;
  } catch (error) {
    if (isRequestCurrent()) {
      loadTimer.logResponseDecodeEnd();
    }
    reportResponseError(context, error, SduiErrorName.FailedToDecodeResponse);
    throw error;
  }
}

async function* decodeStreamingResponse(
  response: Response,
  context: ReportResponseErrorContext,
): AsyncGenerator<SduiApiResponse> {
  const { requestConfig, loadTimer, isRequestCurrent, requestSignal } = context;
  const processFrame = (payload: Uint8Array): SduiApiResponse => {
    if (isRequestCurrent()) {
      loadTimer.logResponseDecodeBegin();
    }
    try {
      const { protoSchema } = requestConfig;
      if (!protoSchema) {
        throw new Error("SDUI decode: protoSchema is required to decode API responses.");
      }
      const decoded = decodeProtobufResponse(protoSchema, payload);
      throwIfAborted(requestSignal);
      return decoded;
    } catch (error) {
      throw new SduiStreamDecodeError(error);
    } finally {
      if (isRequestCurrent()) {
        loadTimer.logResponseDecodeEnd();
      }
    }
  };
  const frameBuilder = createSduiFrameBuilder(processFrame);

  const reader = response.body?.getReader();
  let reachedEndOfStream = false;
  let readerCanceled = false;
  const cancelReader = (): Promise<void> => {
    if (!reader || readerCanceled) return Promise.resolve();
    readerCanceled = true;
    return reader.cancel(requestSignal.reason).catch(() => {
      // Ignore cleanup failures so they do not hide the original error.
    });
  };
  const handleAbort = (): void => {
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void
    void cancelReader();
  };
  requestSignal.addEventListener("abort", handleAbort, { once: true });

  try {
    if (reader) {
      while (!reachedEndOfStream) {
        throwIfAborted(requestSignal);
        // Chunks must be consumed in order because frame boundaries can span reads.
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        throwIfAborted(requestSignal);
        if (done) {
          reachedEndOfStream = true;
          continue;
        }
        if (value.byteLength === 0) continue;

        if (isRequestCurrent()) {
          loadTimer.logUiStreamFirstChunkReceived();
        }
        let decodedResponses: readonly SduiApiResponse[];
        try {
          decodedResponses = frameBuilder.processChunk(value);
        } catch (error) {
          if (isSduiFrameProcessingError<SduiApiResponse>(error)) {
            for (const decoded of error.processedFrames) {
              throwIfAborted(requestSignal);
              yield decoded;
            }
          }
          throw error;
        }
        for (const decoded of decodedResponses) {
          throwIfAborted(requestSignal);
          yield decoded;
        }
      }
    }

    frameBuilder.finalize();
  } catch (error) {
    reportResponseError(
      context,
      error,
      error instanceof SduiStreamDecodeError
        ? SduiErrorName.FailedToDecodeResponse
        : SduiErrorName.FailedToFetchPage,
    );
    throw error;
  } finally {
    requestSignal.removeEventListener("abort", handleAbort);
    if (reader) {
      if (!reachedEndOfStream) await cancelReader();
      reader.releaseLock();
    }
  }
}

export function createSduiRequestExecutor(deps: SduiRequestExecutorDeps) {
  return async function* executeSduiRequest(
    requestConfig: ApiRequestConfig,
    url: Url,
    options: ExecuteSduiRequestOptions,
  ): AsyncGenerator<SduiApiResponse> {
    const { loadTimer, isRequestCurrent, reportPageAnalytics, invalidationSignal } = options;
    const isStreaming = requestConfig.enableStreaming === true;
    const useProtobuf = (requestConfig.responseFormat ?? "json") === "protobuf";
    const { postConfig } = requestConfig;
    const headers: Record<string, string> = {
      Accept: useProtobuf ? "application/x-protobuf" : "application/json",
      ...(postConfig ? { "Content-Type": postConfig.contentType } : {}),
      ...requestConfig.headers,
    };
    const configKey = getConfigKey(requestConfig);
    const { pageContext } = deps;

    const timeoutMs = requestConfig.timeoutMs ?? DEFAULT_SDUI_REQUEST_TIMEOUT_MS;
    const callerSignals = [requestConfig.signal, invalidationSignal].filter(
      (signal): signal is AbortSignal => signal !== undefined,
    );
    const { signal: requestSignal, cleanup: cleanupRequestSignal } = buildRequestSignal(
      timeoutMs,
      callerSignals,
    );
    const fetchOptions: SduiFetchOptions = {
      signal: requestSignal,
      ...(postConfig ? { method: "POST", body: postConfig.body } : {}),
    };

    loadTimer.logUiRequestSent();

    const responseErrorContext: ReportResponseErrorContext = {
      deps,
      requestConfig,
      loadTimer,
      isRequestCurrent,
      reportPageAnalytics,
      requestSignal,
    };

    try {
      const fetchResult = await sduiFetch(url, headers, fetchOptions);

      if (isRequestCurrent()) {
        loadTimer.logUiResponseReceived();
      }

      if (fetchResult.isErr()) {
        const { error } = fetchResult;
        const { errorName, statusCode, message } = classifyFetchError(error, { timeoutMs });
        if (isRequestCurrent()) {
          loadTimer.updateRequestStatus("FailedToLoad");
          if (reportPageAnalytics) {
            emitPageStatusEvent(
              deps.analyticsReporter,
              pageContext,
              requestConfig,
              statusCode,
              error.name,
            );
          }
          reportError(errorName, message, pageContext, { name: configKey }, deps.errorReporter);
        }
        throw error;
      }
      const httpResponse = fetchResult.value;

      if (isRequestCurrent()) {
        loadTimer.updateRequestStatus("LoadedFromNetwork");
        if (reportPageAnalytics) {
          emitPageStatusEvent(
            deps.analyticsReporter,
            pageContext,
            requestConfig,
            httpResponse.status,
          );
          if (httpResponse.ok) {
            emitPagePayloadSizeEvent(
              deps.analyticsReporter,
              pageContext,
              requestConfig,
              httpResponse,
            );
          }
        }
      }

      if (!isStreaming) {
        yield await decodeBufferedResponse(httpResponse, responseErrorContext);
        return;
      }

      yield* decodeStreamingResponse(httpResponse, responseErrorContext);
    } finally {
      cleanupRequestSignal();
    }
  };
}
