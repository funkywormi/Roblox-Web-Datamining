import { executeAction } from "./executeAction";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type { SduiServices } from "../services/SduiServices";
import { FALLBACK_PAGE_CONTEXT } from "../types/analytics";
import type {
  SduiActionContext,
  SduiActionData,
  SduiActionResolver,
  SduiResolvedAction,
  SduiActionSnapshot,
} from "../types";
import { DataStatus } from "../types";

/**
 * Factory that builds an `SduiActionResolver` from a `SduiServices` instance.
 *
 * The resolver converts an action snapshot into an `SduiResolvedAction`
 * with an `onActivated` callback for fire-and-forget UI events, an awaitable
 * `onActivatedAsync` function, and an optional `href` for semantic navigation.
 *
 * Signals produce a new snapshot and rerender when action data changes.
 * Both href resolution and activation use the same rendered snapshot.
 *
 * `configKey` identifies the page payload the actions were rendered from, so
 * handlers that refresh page data act on the entry that produced them.
 */
export function createActionResolver(
  services: SduiServices,
  configKey?: string,
): SduiActionResolver {
  const { actionHandlerRegistry, telemetryHandlerNameRegistry, translate } = services;

  const createActionContext = (actionData?: SduiActionData): SduiActionContext => ({
    apiStore: services.apiStore,
    configKey,
    dataBinder: services.dataBinder,
    analyticsReporter: services.analyticsReporter,
    errorReporter: services.errorReporter,
    pageContext: actionData?.pageContext ?? FALLBACK_PAGE_CONTEXT,
    translate,
  });

  return (snapshot: SduiActionSnapshot): SduiResolvedAction => {
    const currentActionData =
      snapshot.status === DataStatus.Ready ? snapshot.actionData : undefined;
    const currentActionContext = createActionContext(currentActionData);
    const handlerConfig =
      currentActionData === undefined
        ? undefined
        : actionHandlerRegistry.getActionHandler(currentActionData.actionType);
    const href = currentActionData
      ? handlerConfig?.resolveHref?.(
          currentActionData.actionParams,
          currentActionContext,
          currentActionData.analyticsContext,
        )
      : undefined;

    const onActivatedAsync = (paramOverrides?: Record<string, unknown>): Promise<void> => {
      if (snapshot.status !== DataStatus.Ready) {
        const diagnosticActionType = currentActionData?.actionType;
        reportError(
          SduiErrorName.FailedToExecuteAction,
          `rendered action snapshot was unavailable at invocation (actionType=${diagnosticActionType === undefined ? "unknown" : String(diagnosticActionType)}, status=${snapshot.status})`,
          currentActionContext.pageContext,
          diagnosticActionType === undefined
            ? undefined
            : { actionType: String(diagnosticActionType) },
          services.errorReporter,
        );
        return Promise.resolve();
      }

      return executeAction(
        snapshot.actionData,
        actionHandlerRegistry,
        telemetryHandlerNameRegistry,
        createActionContext(snapshot.actionData),
        paramOverrides,
      );
    };

    return {
      href,
      clientNavigation: href != null && handlerConfig?.clientNavigation === true,
      onActivatedAsync,
      onActivated: (paramOverrides?: Record<string, unknown>) => {
        onActivatedAsync(paramOverrides).catch(() => undefined);
      },
    };
  };
}
