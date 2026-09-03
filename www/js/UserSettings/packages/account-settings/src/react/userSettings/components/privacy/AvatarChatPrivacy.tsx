import { Toggle } from "react-style-guide";
import { useTranslation } from "react-utilities";
import React from "react";
import { useSnackbar } from "@rbx/user-settings";
import InlineSettingComponent from "../../../common/components/InlineSettingComponent";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { animateYourAvatarLink } from "../../constants/urlConstants";
import eventService from "../../services/eventServices/eventService";
import cameraIndicator from "../../../../images/camera_indicator.svg";
import { useGetFreeCommunicationInfographicPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { useGetDisplayCameraNotAvailableQuery } from "../../../apis/experimentApi";
import {
  useGetVoiceSettingsQuery,
  useUpdateAvatarVideoEnabledSettingMutation,
} from "../../../apis/voiceApi";

export const AvatarChatPrivacy = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: voicePolicy } = useGetFreeCommunicationInfographicPolicyQuery();
  const { data: voiceSettings } = useGetVoiceSettingsQuery();
  const { data: displayCameraNotAvailable } = useGetDisplayCameraNotAvailableQuery();
  const [updateAvatarVideoEnabledSetting] = useUpdateAvatarVideoEnabledSettingMutation();

  // Avatar chat toggle
  const getAvatarVideoToggleDisabled = (): boolean => {
    return Boolean(voiceSettings?.isAvatarVideoOptInDisabled && !voiceSettings?.isAvatarVideoOptIn);
  };

  const toggleAvatarVideoEnabled = async () => {
    // TODO: Do we want to update these events?
    eventService.avatarInfographicDisplayed();

    if (!voiceSettings) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    } else {
      try {
        await updateAvatarVideoEnabledSetting(!voiceSettings.isAvatarVideoOptIn).unwrap();
        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      } catch {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const avatarVideoToggle = (
    <InlineSettingComponent
      label={translate(privacyTranslationConstants.cameraInputLabel)}
      inputId="voiceChat-toggle"
      description={
        <span className="small text">
          {/* TODO ACCMAN-1893: Update copy */}
          {translate(privacyTranslationConstants.useCameraLabel)}
          <div className="small text">{translate(privacyTranslationConstants.videoNotShared)}</div>
          {/* Camera not available description */}
          {displayCameraNotAvailable && (
            <span
              dangerouslySetInnerHTML={{
                __html: translate(privacyTranslationConstants.cameraNotAvailable, {
                  linkStart: `<a class='text-link' rel='noreferrer' target='_blank' href='${
                    voicePolicy?.cameraLearnMoreLink || animateYourAvatarLink
                  }'>`,
                  linkEnd: "</a>",
                }),
              }}
            />
          )}
          {/* Green dot indicator and description */}
          <br />
          <br />
          <img src={cameraIndicator} width="10" alt="" />
          &nbsp;
          {translate(privacyTranslationConstants.greenDotLabel, { greenDot: "" })}
        </span>
      }
    >
      <Toggle
        isOn={voiceSettings?.isAvatarVideoOptIn ?? false}
        onToggle={async () => {
          await toggleAvatarVideoEnabled();
        }}
        isDisabled={!voiceSettings || getAvatarVideoToggleDisabled()}
      />
    </InlineSettingComponent>
  );

  return <React.Fragment>{avatarVideoToggle}</React.Fragment>;
};

export default AvatarChatPrivacy;
