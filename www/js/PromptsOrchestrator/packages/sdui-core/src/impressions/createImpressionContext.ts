import type { SduiServices } from "../services/SduiServices";
import { FALLBACK_PAGE_CONTEXT } from "../types/analytics";
import type { SduiImpressionContext, SduiPageContext } from "../types";

/**
 * Bundles `SduiServices` + page context into the shared object passed to every
 * `reportImpressions(...)` call.
 */
export function createImpressionContext(
  services: SduiServices,
  pageContext?: SduiPageContext,
): SduiImpressionContext {
  return {
    dataBinder: services.dataBinder,
    analyticsReporter: services.analyticsReporter,
    errorReporter: services.errorReporter,
    pageContext: pageContext ?? FALLBACK_PAGE_CONTEXT,
  };
}
