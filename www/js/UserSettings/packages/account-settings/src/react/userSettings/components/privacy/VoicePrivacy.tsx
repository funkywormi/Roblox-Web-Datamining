import { Toggle } from "react-style-guide";
import { useTranslation } from "react-utilities";
import React from "react";
import { LegallySensitiveContentService } from "Roblox";
import { UserSetting, useSnackbar } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import InlineSettingComponent from "../../../common/components/InlineSettingComponent";
import useVoiceChatModal from "../../../common/hooks/modals/useVoiceChatModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import eventService from "../../services/eventServices/eventService";
import microphoneIndicator from "../../../../images/microphone_indicator.svg";
import {
  useGetVoiceSettingsQuery,
  useUpdateVoiceChatEnabledSettingMutation,
  useUpdateAllowDataUsageEnabledSettingMutation,
} from "../../../apis/voiceApi";
import {
  useGetSettingsUiPolicyQuery,
  useGetFreeCommunicationInfographicPolicyQuery,
} from "../../../apis/universalAppConfigurationApi";
import {
  displayDataConsentSetting,
  displayMicrophoneSetting,
} from "../../utils/voiceAvatarChatUtils";

import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import {
  voiceDataConsentSettingConsentName,
  voiceDataConsentSettingParentSideConsentName,
  voiceDataConsentSettingSurface,
} from "../../constants/privacy/privacyConstants";

export const VoicePrivacy = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: voiceSettings } = useGetVoiceSettingsQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: voicePolicy } = useGetFreeCommunicationInfographicPolicyQuery();
  const [updateVoiceChatEnabledSetting] = useUpdateVoiceChatEnabledSettingMutation();

  const [legallySensitiveContent, legallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      voiceDataConsentSettingConsentName,
      voiceDataConsentSettingSurface,
    );

  const [parentSideLegallySensitiveContent, parentSideLegallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      voiceDataConsentSettingParentSideConsentName,
      voiceDataConsentSettingSurface,
    );

  const isUserPreventedFromUsingChatFeatures = (): boolean => {
    return (
      (voiceSettings?.isBanned ||
        (voiceSettings?.isOptInDisabled && !voiceSettings?.isUserOptIn)) ??
      false
    );
  };

  const [settingsAndOptions] = useGetSettingsAndOptions();

  const dataConsentToggle = (
    <ToggleWithParentalConsent
      label={
        (child
          ? parentSideLegallySensitiveContent.wordsOfConsent.title
          : legallySensitiveContent.wordsOfConsent.title) ?? ""
      }
      description={
        <span
          className="small text"
          dangerouslySetInnerHTML={{
            __html:
              (child
                ? parentSideLegallySensitiveContent.wordsOfConsent.consent
                : legallySensitiveContent.wordsOfConsent.consent) ?? "",
          }}
        />
      }
      childUserId={child?.userId}
      inputId="improveVoice-toggle"
      settingName={UserSetting.allowVoiceDataUsage}
      auditHeader={
        child
          ? parentSideLegallySensitiveActions.getBase64EncodedAuditHeader()
          : legallySensitiveActions.getBase64EncodedAuditHeader()
      }
    />
  );

  // Voice chat toggle
  const getVoiceChatToggleDisabled = (): boolean => {
    return Boolean(voiceSettings?.isOptInDisabled && !voiceSettings?.isUserOptIn);
  };

  const updateVoiceChatSetting = async () => {
    if (!voiceSettings) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    } else {
      try {
        await updateVoiceChatEnabledSetting(!voiceSettings.isUserOptIn).unwrap();
        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      } catch {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const [voiceModal, voiceModalService] = useVoiceChatModal(
    updateVoiceChatSetting,
    voicePolicy?.requireExplicitVoiceConsent ?? true,
  );

  const toggleVoiceChatEnabled = async () => {
    if (!voiceSettings?.isUserOptIn) {
      // TODO: Do we want to update these events?
      eventService.voiceInfographicDisplayed();
      voiceModalService.open();
    } else {
      await updateVoiceChatSetting();
    }
  };

  const getBannedDescription = (): JSX.Element => {
    const { isOptInDisabled, isUserOptIn, isBanned } = voiceSettings || {};
    if (isOptInDisabled && !isUserOptIn) {
      return (
        <div className="small text">{translate(privacyTranslationConstants.optInDisabled)}</div>
      );
    }
    if (!isOptInDisabled && isBanned) {
      return (
        <div className="small text">{translate(privacyTranslationConstants.chatVoiceBan)}</div>
      );
    }
    return <React.Fragment />;
  };

  const microphoneToggle = (
    <InlineSettingComponent
      label={translate(privacyTranslationConstants.voiceChatHeading)}
      inputId="voiceChat-toggle"
      description={
        <div className="small text">
          {translate(privacyTranslationConstants.useMicrophoneLabel)}
          {getBannedDescription()}
          {!isUserPreventedFromUsingChatFeatures() && (
            <React.Fragment>
              <br />
              <br />
              &nbsp;
              <img src={microphoneIndicator} width="10" alt="" />
              {translate(privacyTranslationConstants.redDotLabel, { redDot: "" })}
            </React.Fragment>
          )}
        </div>
      }
    >
      <Toggle
        isOn={voiceSettings?.isUserOptIn ?? false}
        onToggle={async () => {
          eventService.voiceOptInToggleRequested(!voiceSettings?.isUserOptIn);
          await toggleVoiceChatEnabled();
        }}
        isDisabled={!voiceSettings || getVoiceChatToggleDisabled()}
      />
    </InlineSettingComponent>
  );

  return (
    <React.Fragment>
      <React.Fragment>
        {displayDataConsentSetting(settingsAndOptions, uiPolicy) && dataConsentToggle}
        {!child && displayMicrophoneSetting(voiceSettings, uiPolicy) && microphoneToggle}
      </React.Fragment>
      {voiceModal}
    </React.Fragment>
  );
};

export default VoicePrivacy;
