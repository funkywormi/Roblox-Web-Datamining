import { createInteractionUuid, reportActionAnalytics } from "../analytics/reportActionAnalytics";
import { SduiErrorName } from "../errors/SduiErrors";
import type { SduiTelemetryHandlerNameRegistry } from "../registry/SduiTelemetryHandlerNameRegistry";
import type {
  ActionConfig,
  AnalyticsContext,
  SduiActionContext,
  SduiActionData,
  SduiActionHandlerConfig,
} from "../types";
import { actionTypeName } from "../utils/protoEnum";

/**
 * Single entry point for action telemetry.
 *
 * Custom telemetry (impression handler / override parity):
 *   1. Server-named handler from `actionData.telemetryHandler` — wins if set
 *      (even on miss; an unknown name reports an error and skips later custom
 *      branches).
 *   2. Else a name resolved from the merged action params by the handler config.
 *   3. Else client default from `handlerConfig.telemetryHandler`.
 *   4. Else if `actionData.actionEventName` is set → fire itemAction-shaped
 *      payload under that name (from `Action.action_event_name`).
 *
 * Then generic `itemAction` fires unless `handlerConfig.skipUnifiedLogging`.
 * All default report calls in this invocation share one `interactionUuid`
 * (from `actionParams` when the template supplies it, otherwise generated once).
 */
export function logActionTelemetry(
  actionData: SduiActionData,
  actionConfig: ActionConfig,
  handlerConfig: SduiActionHandlerConfig,
  analyticsContext: AnalyticsContext | undefined,
  actionContext: SduiActionContext,
  telemetryHandlerNameRegistry: SduiTelemetryHandlerNameRegistry,
): void {
  const { analyticsReporter, errorReporter, pageContext } = actionContext;
  const { telemetryHandler: serverNamedHandler, actionEventName } = actionData;
  const skipUnifiedLogging = handlerConfig.skipUnifiedLogging === true;
  const namedHandlerName =
    serverNamedHandler ??
    handlerConfig.resolveTelemetryHandlerName?.(actionConfig, analyticsContext, actionContext);

  const fromParams = actionConfig.actionParams.interactionUuid;
  const interactionUuid = typeof fromParams === "string" ? fromParams : createInteractionUuid();

  if (namedHandlerName) {
    const namedHandler = telemetryHandlerNameRegistry.getTelemetryHandler(namedHandlerName);
    if (namedHandler) {
      namedHandler(actionConfig, analyticsContext, actionContext);
    } else {
      errorReporter.reportSduiError(
        SduiErrorName.FailedToExecuteAction,
        `Unknown telemetry handler name: ${namedHandlerName} (actionType=${actionConfig.actionType})`,
        pageContext,
        { name: namedHandlerName, actionType: actionTypeName(actionConfig.actionType) },
      );
    }
  } else if (handlerConfig.telemetryHandler) {
    handlerConfig.telemetryHandler(actionConfig, analyticsContext, actionContext);
  } else if (actionEventName != null && analyticsContext) {
    // No telemetry handler — fire default payload under the custom name.
    reportActionAnalytics(
      actionConfig,
      analyticsContext,
      pageContext,
      analyticsReporter,
      errorReporter,
      {
        eventNameOverride: actionEventName,
        interactionUuid,
      },
    );
  }

  if (skipUnifiedLogging) return;

  if (!analyticsContext) {
    errorReporter.reportSduiError(
      SduiErrorName.ReportItemActionMissingCollectionData,
      `Could not reportActionAnalytics. Missing analyticsContext for actionType=${actionConfig.actionType}`,
      pageContext,
    );
    return;
  }

  reportActionAnalytics(
    actionConfig,
    analyticsContext,
    pageContext,
    analyticsReporter,
    errorReporter,
    { interactionUuid },
  );
}
