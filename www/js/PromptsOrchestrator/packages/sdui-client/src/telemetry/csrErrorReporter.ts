import type {
  SduiErrorDimensions,
  SduiErrorReporter,
  SduiPageContext,
  ReportSduiErrorAdditionalOptions,
} from "@rbx/sdui-core";
import { captureError, captureErrorInSentry, getErrorPageContext } from "./errorReporterUtils";

const ERROR_EVENT_NAME = "webDiscoverySduiError";
const SDUI_APPLICATION_NAME = "sdui";
const SDUI_ERROR_TAG_NAME = "sduiErrorName";
const SDUI_COMPONENT_TYPE_TAG_KEY = "sduiComponentType";

/**
 * These defaults are exposed to allow teams to create a separate error reporter
 * instance that can emit errors to their own sentry groupings and eventstream tables
 * ```
 * const errorReporter = createCsrErrorReporter({ applicationName: "webPrompts" });
 * errorReporter.reportSduiError("Error", "Error message");
 * // -> Sentry: { fingerprint: ["webPrompts", "Error", "componentName"], tags: { sduiErrorName: "Error" } }
 * ```
 * Note that if these defaults are overridden when creating the
 * SduiErrorReporter for SDUI services, your team will be responsible for
 * monitoring or forwarding SDUI errors
 * ```
 * const services = getOrCreateSduiClientPageServices("page", {
 *   errorReporter: createCsrErrorReporter({
 *     applicationName: "webPrompts",
 *     errorNameTagKey: "promptErrorName",
 *   }),
 * })
 * ```
 */
type SduiErrorReporterDefaults = {
  /**
   * This sets the first segment of the Sentry fingerprint.
   *
   * @default "sdui"
   * @example
   * applicationName: "webPrompts",
   * -> fingerprint: ["webPrompts", "Error", "componentName"]
   */
  applicationName?: string;
  /**
   * This sets the name of the tag for the error name in Sentry.
   *
   * @default "sduiErrorName"
   * @example
   * errorNameTagKey: "promptErrorName",
   * -> tags: { promptErrorName: "Error" }
   */
  errorNameTagKey?: string;
  /**
   * This sets the name of the event in the eventstream table.
   *
   * @default "webDiscoverySduiError"
   */
  eventName?: string;
};

export type CreateCsrErrorReporterDefaults = Partial<SduiErrorReporterDefaults>;

export function createCsrErrorReporter(
  reporterDefaults: CreateCsrErrorReporterDefaults = {},
): SduiErrorReporter {
  const {
    applicationName = SDUI_APPLICATION_NAME,
    errorNameTagKey = SDUI_ERROR_TAG_NAME,
    eventName = ERROR_EVENT_NAME,
  } = reporterDefaults;

  return {
    reportSduiError(
      errorName: string,
      errorMessage: string,
      pageContext?: SduiPageContext,
      dimensions?: SduiErrorDimensions,
      additionalOptions?: ReportSduiErrorAdditionalOptions,
    ): void {
      const appPage = getErrorPageContext(pageContext);

      captureError({
        eventName,
        errorContext: appPage,
        errorName,
        errorMessage,
      });

      const { additionalTags, additionalContext, additionalFingerprint } = additionalOptions ?? {};

      const sduiComponentType = dimensions?.componentType;

      captureErrorInSentry({
        applicationName,
        errorNameTagKey,
        errorName,
        errorMessage,
        appPage,
        additionalTags: sduiComponentType
          ? {
              // Note: this is not configurable because it's retrieved from the
              // SDUI error dimension. Pass componentType to `additionalTags` instead
              // of setting it in `dimensions` if you want a custom key
              [SDUI_COMPONENT_TYPE_TAG_KEY]: sduiComponentType,
              ...additionalTags,
            }
          : additionalTags,
        additionalContext: dimensions ? { ...dimensions, ...additionalContext } : additionalContext,
        additionalFingerprint: [
          ...(sduiComponentType ? [sduiComponentType] : []),
          ...(additionalFingerprint ?? []),
        ],
      });
    },
  };
}
