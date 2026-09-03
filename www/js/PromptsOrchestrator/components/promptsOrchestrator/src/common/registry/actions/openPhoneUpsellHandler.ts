import "@rbx/core-scripts/global";
import {
  ActionType,
  actionTypeName,
  type SduiActionHandlerConfig,
  readStringActionParam,
  readSduiResolvedActionParam,
  readBooleanActionParam,
} from "@rbx/sdui-core";

import { PromptErrorName } from "../../telemetry/constants";
import { extractErrorMessageFromUnknownError } from "../../utils/errorMessageUtils";
import { PhoneUpsellLocalizationKey } from "../../constants/upsellConstants";
import { getVoicePolicy } from "../../services/guacService";
import { optUserInToVoiceChat } from "../../services/voiceService";

const handleBeforeSuccess = async (): Promise<[string, string]> => {
  try {
    const success = (await optUserInToVoiceChat(true, false)).isUserOptIn;
    return success
      ? [
          PhoneUpsellLocalizationKey.VoiceChatEnabledHeading,
          PhoneUpsellLocalizationKey.CanNowJoinVoiceDescription,
        ]
      : [
          PhoneUpsellLocalizationKey.PhoneIsVerifiedHeading,
          PhoneUpsellLocalizationKey.TurnOnVoiceChatDescription,
        ];
  } catch {
    return [
      PhoneUpsellLocalizationKey.PhoneIsVerifiedHeading,
      PhoneUpsellLocalizationKey.TurnOnVoiceChatDescription,
    ];
  }
};

export const openPhoneUpsellHandler = {
  handler: async (actionConfig, _analyticsContext, sduiContext) => {
    /**
     * The open phone upsell action also supports the following action params.
     * They are not supported on web:
     * 1. onFailure - As of Aug 5, 2026 this is also a noop on lua
     */
    const { actionParams } = actionConfig;
    const { errorReporter, pageContext } = sduiContext;

    const upsellService = window.Roblox.UpsellService;

    if (!upsellService) {
      errorReporter.reportSduiError(
        PromptErrorName.UpsellServiceDoesNotExist,
        "Could not proceed with phone upsell because UpsellService does not exist",
        pageContext,
        {
          actionType: actionTypeName(ActionType.OPEN_PHONE_UPSELL_MODAL),
        },
      );
      return;
    }

    const onSuccess = readSduiResolvedActionParam(actionParams, "onSuccess", undefined);
    const onCancelled = readSduiResolvedActionParam(actionParams, "onCancelled", undefined);
    const addPhoneDescriptionKey = readStringActionParam(
      actionParams,
      "addPhoneDescriptionKey",
      undefined,
    );
    const origin = readStringActionParam(actionParams, "origin", "unknown");

    const voiceOptIn = readBooleanActionParam(actionParams, "voiceOptIn", false);

    const handleClose = (isPhoneVerified: boolean) => {
      if (isPhoneVerified) {
        onSuccess?.onActivated();
      } else {
        onCancelled?.onActivated();
      }
    };

    if (voiceOptIn) {
      let requireExplicitVoiceConsent: boolean;
      try {
        ({ requireExplicitVoiceConsent } = await getVoicePolicy());
      } catch (error) {
        // Defensive fallback to ensure compliance if api call fails
        requireExplicitVoiceConsent = true;
        const errorMessage = extractErrorMessageFromUnknownError(
          error,
          "Failed to fetch voice policy",
        );
        errorReporter.reportSduiError(
          PromptErrorName.FailedToFetchVoicePolicy,
          errorMessage,
          pageContext,
          {
            actionType: actionTypeName(ActionType.OPEN_PHONE_UPSELL_MODAL),
          },
        );
      }

      /**
       * TODO: Once the modal queue is implemented, this should use it.
       * Unlike the email/FAE, this modal opens even if you have a phone number
       */
      upsellService.renderPhoneUpsell({
        addPhoneRequireLegalTextCheckbox: requireExplicitVoiceConsent,
        addPhoneHeadingKey: PhoneUpsellLocalizationKey.AddPhoneVoiceAction,
        addPhoneDescriptionKey:
          addPhoneDescriptionKey ?? PhoneUpsellLocalizationKey.AddPhoneNumberDescription,
        addPhoneButtonKey: PhoneUpsellLocalizationKey.VerifyAction,
        addPhoneLegalTextKey: requireExplicitVoiceConsent
          ? PhoneUpsellLocalizationKey.VoiceLegalConsentDescription
          : PhoneUpsellLocalizationKey.VoiceLegalDisclaimerDescription,
        origin,
        onClose: handleClose,
        beforeSuccess: handleBeforeSuccess,
      });
    } else {
      /**
       * TODO: Once the modal queue is implemented, this should use it.
       * Unlike the email/FAE, this modal opens even if you have a phone number
       */
      upsellService.renderPhoneUpsell({
        addPhoneDescriptionKey,
        origin,
        onClose: handleClose,
      });
    }
  },
} satisfies SduiActionHandlerConfig;
