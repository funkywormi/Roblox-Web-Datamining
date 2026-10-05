import type {
  ReportSduiErrorAdditionalOptions,
  SduiErrorDimensions,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";

/**
 * Forward an SDUI error to the supplied reporter, or `console.warn` in
 * development when none is supplied. Service reporters are decorated with
 * instance-scoped deduplication during service construction.
 */
export function reportError(
  errorType: string,
  message: string,
  pageContext?: SduiPageContext,
  dimensions?: SduiErrorDimensions,
  errorReporter?: SduiErrorReporter,
  additionalOptions?: ReportSduiErrorAdditionalOptions,
): void {
  if (errorReporter) {
    errorReporter.reportSduiError(errorType, message, pageContext, dimensions, additionalOptions);
    return;
  }

  // TODO (SSR Support): replace with centralized env util when supporting SSR
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[sdui-core] ${errorType}: ${message}`);
  }
}
