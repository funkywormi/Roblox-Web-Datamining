import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  clientOnly,
  readParam,
  type SduiActionHandlerConfig,
} from "@rbx/sdui-core";
import { openAccountSettings } from "../openAccountSettings";

const ACTION_TYPE_NAME = actionTypeName(ActionType.OPEN_ACCOUNT_SETTINGS);

/**
 * Handles `OpenAccountSettingsAction` by delegating to `openAccountSettings`, so SDUI surfaces
 * open the same settings, presented the same way, as any other caller.
 */
export const openAccountSettingsActionHandler: SduiActionHandlerConfig = {
  handler: clientOnly((actionConfig, _analyticsContext, ctx) => {
    const surfaceKey = readParam(actionConfig.actionParams, "surfaceKey", "surface_key");
    if (surfaceKey === undefined || surfaceKey.trim() === "") {
      ctx.errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Missing or invalid surfaceKey for ${ACTION_TYPE_NAME}`,
        ctx.pageContext,
        { actionType: ACTION_TYPE_NAME, propName: "surfaceKey" },
      );
      return;
    }

    openAccountSettings({ surfaceKey });
  }),
  skipUnifiedLogging: false,
};
