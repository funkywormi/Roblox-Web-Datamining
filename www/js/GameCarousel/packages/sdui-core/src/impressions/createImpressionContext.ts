import type { SduiServices } from "../services/SduiServices";
import type { SduiImpressionContext } from "../types";

/**
 * Bundles `SduiServices` + page context into the shared object passed to every
 * `reportImpressions(...)` call.
 */
export function createImpressionContext(services: SduiServices): SduiImpressionContext {
  return {
    dataBinder: services.dataBinder,
    analyticsReporter: services.analyticsReporter,
    errorReporter: services.errorReporter,
    pageContext: services.pageContext,
  };
}
