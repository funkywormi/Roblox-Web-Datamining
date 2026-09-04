import type { SduiPageContext } from "./analytics";
import type { SduiErrorReporter } from "./error";

export type SduiRequestStatus = "LoadedFromNetwork" | "FailedToLoad";

/**
 * Load-pipeline milestones recorded by `SduiLoadTimer`.
 */
export enum SduiLoadTimerMilestone {
  RequestQueued = "request_queued",
  RequestSent = "request_sent",
  ResponseReceived = "response_received",
  ResponseDecodeBegin = "response_decode_begin",
  ResponseDecodeEnd = "response_decode_end",
  DataUpdateBegin = "data_update_begin",
  DataUpdateEnd = "data_update_end",
  ConfigBuildBegin = "config_build_begin",
  ConfigBuildEnd = "config_build_end",
  RefreshComplete = "refresh_complete",
}

/**
 * Derived phases measured between two milestones.
 */
export enum SduiLoadPhase {
  NetworkInflight = "network_inflight",
  ResponseDecode = "response_decode",
  DataUpdate = "data_update",
  ConfigBuild = "config_build",
}

export type SduiLoadTimerStatus = "NotStarted" | "Running" | "Finished";

export interface CreateSduiLoadTimerOptions {
  pageContext?: SduiPageContext;
  errorReporter?: SduiErrorReporter;
}

export interface SduiLoadTimer {
  start(startSource: string): void;
  finish(): void;
  logUiRequestQueued(): void;
  logUiRequestSent(): void;
  logUiResponseReceived(): void;
  logResponseDecodeBegin(): void;
  logResponseDecodeEnd(): void;
  logResponseDataStoreUpdateBegin(): void;
  logResponseDataStoreUpdateEnd(): void;
  logConfigBuildBegin(): void;
  logConfigBuildEnd(): void;
  logRefreshComplete(): void;
  updateRequestStatus(requestStatus: SduiRequestStatus): void;
}
