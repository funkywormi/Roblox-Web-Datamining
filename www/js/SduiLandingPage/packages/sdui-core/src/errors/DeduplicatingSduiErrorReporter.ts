import type {
  ReportSduiErrorAdditionalOptions,
  SduiErrorDimensions,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";

const deduplicatingReporters = new WeakSet<SduiErrorReporter>();

function isDeduplicatingErrorReporter(reporter: SduiErrorReporter): boolean {
  return deduplicatingReporters.has(reporter);
}

/**
 * Serializes `additionalTags` order-independently so two reports that set the
 * same tags in a different literal order share one key.
 */
function serializeAdditionalTags(
  additionalTags?: ReportSduiErrorAdditionalOptions["additionalTags"],
): string {
  const tags = additionalTags;
  if (!tags) return "";

  return Object.keys(tags)
    .sort()
    .map(tagName => `${tagName}=${String(tags[tagName])}`)
    .join(",");
}

function buildDedupKey(
  errorType: string,
  pageContext?: SduiPageContext,
  dimensions?: SduiErrorDimensions,
  additionalOptions?: ReportSduiErrorAdditionalOptions,
): string {
  return [
    errorType,
    pageContext?.appPage ?? "",
    dimensions?.name ?? "",
    dimensions?.componentType ?? "",
    dimensions?.parserName ?? "",
    dimensions?.propName ?? "",
    dimensions?.bindingPath ?? "",
    dimensions?.contentType ?? "",
    dimensions?.actionType ?? "",
    serializeAdditionalTags(additionalOptions?.additionalTags),
    additionalOptions?.additionalFingerprint?.join(",") ?? "",
  ].join("|");
}

/**
 * Decorate an SDUI error sink with instance-scoped fingerprint deduplication.
 *
 * Service construction applies this decorator before distributing the reporter,
 * so callers get the same behavior whether they invoke `reportSduiError`
 * directly or use the `reportError` helper.
 */
export function createDeduplicatingErrorReporter(reporter: SduiErrorReporter): SduiErrorReporter {
  if (isDeduplicatingErrorReporter(reporter)) return reporter;

  const seenErrorKeys = new Set<string>();
  const deduplicatingReporter: SduiErrorReporter = {
    reportSduiError(
      errorType: string,
      message: string,
      pageContext?: SduiPageContext,
      dimensions?: SduiErrorDimensions,
      additionalOptions?: ReportSduiErrorAdditionalOptions,
    ): void {
      const key = buildDedupKey(errorType, pageContext, dimensions, additionalOptions);
      if (seenErrorKeys.has(key)) return;
      seenErrorKeys.add(key);

      reporter.reportSduiError(errorType, message, pageContext, dimensions, additionalOptions);
    },
  };
  deduplicatingReporters.add(deduplicatingReporter);
  return deduplicatingReporter;
}
