import type { SduiAnalyticsReporter, SduiErrorReporter } from "@rbx/sdui-core";
import { createCsrAnalyticsReporter } from "./csrAnalyticsReporter";
import { createCsrErrorReporter, type CreateCsrErrorReporterDefaults } from "./csrErrorReporter";

export interface SduiCsrTelemetry {
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
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
  };
}
