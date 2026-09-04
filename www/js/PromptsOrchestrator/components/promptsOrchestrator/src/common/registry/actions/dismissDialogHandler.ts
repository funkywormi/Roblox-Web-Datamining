import "@rbx/core-scripts/global";
import {
  actionTypeName,
  readStringActionParam,
  SduiErrorName,
  type SduiActionHandlerConfig,
} from "@rbx/sdui-core";
import { finishPrompt } from "../../../overlay-orchestrator/scheduler/finishPrompt";
import { OverlayClosedReason } from "../../../overlay-orchestrator/types";

export const dismissDialogHandler = {
  handler: (actionConfig, _analyticsContext, sduiContext) => {
    const { actionParams, actionType } = actionConfig;
    const { errorReporter, pageContext, pageEntryIdentifier } = sduiContext;

    const dialogType = readStringActionParam(actionParams, "dialogType", undefined);

    if (dialogType === "centralOverlay") {
      if (pageEntryIdentifier !== undefined) {
        finishPrompt(pageEntryIdentifier, {
          status: "closed",
          reason: OverlayClosedReason.Dismissed,
        });
      } else {
        errorReporter.reportSduiError(
          SduiErrorName.FailedToExecuteAction,
          "Missing pageEntryIdentifier for centralOverlay dismiss",
          pageContext,
          {
            actionType: actionTypeName(actionType),
          },
        );
      }
    } else {
      errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Invalid dialogType. Received: ${dialogType}`,
        pageContext,
        {
          propName: "dialogType",
          actionType: actionTypeName(actionType),
        },
      );
    }
  },
} satisfies SduiActionHandlerConfig;
