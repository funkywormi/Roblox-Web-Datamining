import type {
  SduiAnalyticsReporter,
  SduiErrorReporter,
  SduiPageLoadPlatformAdapter,
  SduiWebVitalsObserver,
} from "@rbx/sdui-core";
import { createCsrAnalyticsReporter } from "./csrAnalyticsReporter";
import { createCsrErrorReporter, type CreateCsrErrorReporterDefaults } from "./csrErrorReporter";
import { observeSduiWebVitals } from "./observeSduiWebVitals";
import { browserPageLoadPlatformAdapter } from "./browserPageLoadPlatformAdapter";

export interface SduiCsrTelemetry {
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
  observeWebVitals: SduiWebVitalsObserver;
  pageLoadPlatformAdapter: SduiPageLoadPlatformAdapter;
}

export type SduiCsrTelemetryDefaults = {
  errorReporterDefaults?: CreateCsrErrorReporterDefaults;
};

/**
 * Creates CSR-specific analytics and error reporters for SDUI V2.
 */
export function createSduiCsrTelemetry(defaults: SduiCsrTelemetryDefaults = {}): SduiCsrTelemetry {
  return {
    analyticsReporter: createCsrAnalyticsReporter(),
    errorReporter: createCsrErrorReporter(defaults.errorReporterDefaults),
    observeWebVitals: observeSduiWebVitals,
    pageLoadPlatformAdapter: browserPageLoadPlatformAdapter,
  };
}
