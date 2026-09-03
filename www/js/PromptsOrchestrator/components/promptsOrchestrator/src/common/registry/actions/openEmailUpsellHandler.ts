import "@rbx/core-scripts/global";
import {
  ActionType,
  actionTypeName,
  readSduiResolvedActionParam,
  readStringActionParam,
  SduiErrorName,
  type SduiActionHandlerConfig,
} from "@rbx/sdui-core";
import { PromptErrorName } from "../../telemetry/constants";
import { EmailUpsellOrigin } from "../../constants/upsellConstants";

export const openEmailUpsellHandler = {
  handler: (actionConfig, _analyticsContext, sduiContext) => {
    /**
     * The open email upsell action also supports the following action params.
     * They are not supported on web:
     * 1. addEmailOver13TextKey - Taken care of by the UpsellService
     * 2. addEmailTitleKey - Taken care of by the UpsellService
     * 3. isEmailModalCalledFromHomePage - On lua this is used to determine if a
     *    lock (true) or envelope (false) is displayed. Web only renders the lock
     * 4. eventContext - This sets the event stream name for upsell events. This
     *    is taken care of by the UpsellService
     * 5. section - "addEmail" or "verifyEmail". This is added to analytics
     *    events and taken care of by the UpsellService.
     */
    const { actionParams } = actionConfig;
    const { errorReporter, pageContext } = sduiContext;

    const upsellService = window.Roblox.UpsellService;

    if (!upsellService) {
      errorReporter.reportSduiError(
        PromptErrorName.UpsellServiceDoesNotExist,
        "Could not proceed with email upsell because UpsellService does not exist",
        pageContext,
        {
          actionType: actionTypeName(ActionType.OPEN_EMAIL_UPSELL_MODAL),
        },
      );
      return;
    }

    const onSuccess = readSduiResolvedActionParam(actionParams, "onSuccess", undefined);
    const onFailure = readSduiResolvedActionParam(actionParams, "onFailure", undefined);
    const origin = readStringActionParam(actionParams, "origin", undefined);

    if (origin === EmailUpsellOrigin.Homepage) {
      /**
       * TODO: Once the modal queue is implemented, this should use it.
       * One difficulty for the queue is that the email upsell modal does not
       * render if the user already has an email. There is no way to know if
       * this happens, and can make it hard for the queue to know when the modal
       * is closed
       */
      upsellService.renderEmailUpsell((isEmailAdded: boolean) => {
        if (isEmailAdded) {
          onSuccess?.onActivated();
        } else {
          onFailure?.onActivated();
        }
      });
    } else {
      errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Invalid origin. Received: ${origin}`,
        pageContext,
        {
          propName: "origin",
          actionType: actionTypeName(ActionType.OPEN_EMAIL_UPSELL_MODAL),
        },
      );
    }
  },
} satisfies SduiActionHandlerConfig;
