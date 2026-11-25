import type {
  ActionConfig,
  AnalyticsContext,
  SduiActionContext,
  SduiActionHandler,
} from "../types";

/**
 * Wraps `handler` so it no-ops in non-browser environments.
 */
export function clientOnly(handler: SduiActionHandler): SduiActionHandler {
  return (
    actionConfig: ActionConfig,
    analyticsContext: AnalyticsContext,
    ctx: SduiActionContext,
  ) => {
    if (typeof window === "undefined") return;
    return handler(actionConfig, analyticsContext, ctx);
  };
}
