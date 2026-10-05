import type { SduiAnalyticsReporter, SduiPageContext } from "./analytics";
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
  LoadPipelineFinished = "load_pipeline_finished",
  ComponentMounted = "component_mounted",
  ComponentPainted = "component_painted",
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

/**
 * Core Web Vitals snapshot at EventIngest emit time. Units match
 * `web_vitals.proto`: LCP/FCP/TTFB/INP in milliseconds, CLS unitless.
 */
export interface SduiWebVitalsSnapshot {
  lcp?: number;
  fcp?: number;
  ttfb?: number;
  cls?: number;
  inp?: number;
}

export type SduiWebVitalsObserver = (
  onChange: (snapshot: SduiWebVitalsSnapshot) => void,
) => () => void;

/**
 * Platform-specific page lifecycle used by the isomorphic load
 * timer. CSR supplies a browser implementation; SSR may omit it.
 */
export interface SduiPageLoadPlatformAdapter {
  isPageHidden(): boolean;
  observePageHidden(onHidden: () => void): () => void;
  scheduleFallback(callback: () => void, delayMs: number): () => void;
}

export interface CreateSduiLoadTimerOptions {
  pageContext?: SduiPageContext;
  errorReporter?: SduiErrorReporter;
  analyticsReporter?: SduiAnalyticsReporter;
  observeWebVitals?: SduiWebVitalsObserver;
  pageLoadPlatformAdapter?: SduiPageLoadPlatformAdapter;
  /**
   * Milliseconds after first SDUI paint to emit without LCP.
   * Defaults to {@link SDUI_PAGE_LOAD_LCP_FALLBACK_DELAY_MS}.
   */
  lcpFallbackDelayMs?: number;
  /**
   * Milliseconds after pipeline finish to emit when no SDUI paint occurs.
   * Defaults to {@link SDUI_PAGE_LOAD_NO_PAINT_FALLBACK_DELAY_MS}.
   */
  noPaintFallbackDelayMs?: number;
}

export interface SduiLoadTimer {
  start(startSource: string): void;
  finish(): void;
  dispose(): void;
  logUiRequestQueued(): void;
  logUiRequestSent(): void;
  logUiResponseReceived(): void;
  logResponseDecodeBegin(): void;
  logResponseDecodeEnd(): void;
  logResponseDataStoreUpdateBegin(): void;
  logResponseDataStoreUpdateEnd(): void;
  logConfigBuildBegin(): void;
  logConfigBuildEnd(): void;
  logComponentMounted(): void;
  logComponentPainted(): void;
  logRefreshComplete(): void;
  updateRequestStatus(requestStatus: SduiRequestStatus): void;
  setWebVitals(snapshot: SduiWebVitalsSnapshot): void;
}

/** Delay after first SDUI paint before emitting without an LCP value. */
export const SDUI_PAGE_LOAD_LCP_FALLBACK_DELAY_MS = 5000;

/**
 * Delay after pipeline finish before emitting when no SDUI paint occurs
 * (empty successful loads, never-foregrounded tabs). Separate from
 * {@link SDUI_PAGE_LOAD_LCP_FALLBACK_DELAY_MS} so the LCP wait stays paint-relative.
 */
export const SDUI_PAGE_LOAD_NO_PAINT_FALLBACK_DELAY_MS = 15_000;
