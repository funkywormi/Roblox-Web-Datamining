import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type { SduiActionHandlerRegistry } from "../registry/SduiActionHandlerRegistry";
import type { SduiTelemetryHandlerNameRegistry } from "../registry/SduiTelemetryHandlerNameRegistry";
import type { ActionConfig, SduiActionContext, SduiActionData } from "../types";
import { actionTypeName } from "../utils/protoEnum";
import { logActionTelemetry } from "./logActionTelemetry";

const EMPTY_ANALYTICS_CONTEXT = {
  analyticsData: {},
  getAnalyticsDataSnapshot: () => ({}),
  getAncestorAnalyticsDataSnapshot: () => ({}),
};

function reportActionExecutionFailure(
  actionType: SduiActionData["actionType"],
  error: unknown,
  actionContext: SduiActionContext,
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const readableActionType = actionTypeName(actionType);
  reportError(
    SduiErrorName.FailedToExecuteAction,
    `action handler failed for actionType="${readableActionType}": ${errorMessage}`,
    actionContext.pageContext,
    { actionType: readableActionType },
    actionContext.errorReporter,
  );
}

/**
 * Execute an SDUI action at dispatch time.
 *
 * Params are already resolved at build time by `buildActionProp`, so this
 * function merges any caller-provided overrides, dispatches telemetry via
 * `logActionTelemetry`, then invokes the registered handler.
 */
export async function executeAction(
  actionData: SduiActionData,
  actionHandlerRegistry: SduiActionHandlerRegistry,
  telemetryHandlerNameRegistry: SduiTelemetryHandlerNameRegistry,
  actionContext: SduiActionContext,
  paramOverrides?: Record<string, unknown>,
): Promise<void> {
  const { actionType, actionParams, analyticsContext } = actionData;

  const handlerConfig = actionHandlerRegistry.getActionHandler(actionType);
  if (!handlerConfig) {
    const readableActionType = actionTypeName(actionType);
    // Config bug: the template references an action whose handler the
    // host app never registered.
    reportError(
      SduiErrorName.MissingActionResolver,
      `no handler registered for actionType="${readableActionType}"`,
      actionContext.pageContext,
      { actionType: readableActionType },
      actionContext.errorReporter,
    );
    return;
  }

  const mergedParams = paramOverrides ? { ...actionParams, ...paramOverrides } : actionParams;
  const actionConfig: ActionConfig = { actionType, actionParams: mergedParams };

  logActionTelemetry(
    actionData,
    actionConfig,
    handlerConfig,
    analyticsContext,
    actionContext,
    telemetryHandlerNameRegistry,
  );

  try {
    await handlerConfig.handler?.(
      actionConfig,
      analyticsContext ?? EMPTY_ANALYTICS_CONTEXT,
      actionContext,
    );
  } catch (error) {
    reportActionExecutionFailure(actionType, error, actionContext);
    throw error;
  }
}
