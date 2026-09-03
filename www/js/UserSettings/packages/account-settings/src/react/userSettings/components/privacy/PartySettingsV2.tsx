import React, { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import { LegallySensitiveContentService } from "Roblox";
import {
  RequirementType,
  PartySettingsValue,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { Access } from "../../../../types/accessManagementTypes";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import {
  getWhoCanPartyWithMeOptions,
  getWhoCanUsePartyChatWithMeOptions,
  getWhoCanUsePartyVoiceWithMeOptions,
  whoCanPartyWithMeConsentName,
  whoCanPartyWithMeV2ConsentName,
  whoCanPartyWithMeParentSideConsentName,
  whoCanPartyWithMeParentSideV2ConsentName,
  whoCanPartyWithMeTrustedFriendsConsentName,
  whoCanPartyWithMeTrustedFriendsV2ConsentName,
  whoCanPartyWithMeParentSideRemovedCommsConsentName,
  whoCanPartyWithMeParentSideRemovedCommsV2ConsentName,
  whoCanUsePartyChatWithMeConsentName,
  whoCanUsePartyChatWithMeV2ConsentName,
  whoCanUsePartyChatWithMeParentSideConsentName,
  whoCanUsePartyChatWithMeParentSideV2ConsentName,
  whoCanUsePartyChatWithMeTrustedFriendsConsentName,
  whoCanUsePartyChatWithMeTrustedFriendsV2ConsentName,
  whoCanUsePartyChatWithMeParentSideTrustedFriendsConsentName,
  whoCanUsePartyChatWithMeParentSideTrustedFriendsV2ConsentName,
  whoCanUsePartyVoiceWithMeConsentName,
  whoCanUsePartyVoiceWithMeV2ConsentName,
  whoCanUsePartyVoiceWithMeParentSideConsentName,
  whoCanUsePartyVoiceWithMeParentSideV2ConsentName,
  whoCanUsePartyVoiceWithMeTrustedFriendsConsentName,
  whoCanUsePartyVoiceWithMeTrustedFriendsV2ConsentName,
  whoCanUsePartyVoiceWithMeParentSideTrustedFriendsConsentName,
  whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2ConsentName,
  partySettingsSurface,
} from "../../constants/privacy/privacyConstants";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import birthdayUtils from "../../utils/birthdayUtils";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import baseApi from "../../../apis/common/baseApi";
import { getChildSettingsCacheTag } from "../../../apis/parentalControlsApi";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";

export const PartySettingsV2 = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  const canSeeChatTerminology = child?.userId
    ? child.canSeeChatTerminology
    : uiPolicy?.canSeeChatTerminology;
  const shouldShowTFRestrictiveCommsCopy = child?.userId
    ? child.shouldShowTFRestrictiveCommsCopy
    : uiPolicy?.shouldShowTFRestrictiveCommsCopy;

  const [settingsAndOptions] = useGetSettingsAndOptionsV2(child?.userId);

  const partyChatAvailable =
    (settingsAndOptions?.[UserSetting.whoCanUsePartyChatWithMe]?.options?.length ?? 0) > 1;
  const partyVoiceAvailable =
    (settingsAndOptions?.[UserSetting.whoCanUsePartyVoiceWithMe]?.options?.length ?? 0) > 1;
  const shouldShowRemovedCommsCopy =
    !!settingsAndOptions && !partyChatAvailable && !partyVoiceAvailable;

  const [updateSettingValue] = useUpdateUserSettingValueMutation();

  const { handleAgeCheckUpsells, errorModal } = useAgeVerificationUpsell();
  const consentRequirementsV2 = useAppSelector(
    selectSettingConsentRequirementsV2(child?.userId ?? authenticatedUser.id!),
  );

  const [whoCanPartyWithMeContent, whoCanPartyWithMeActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanPartyWithMeTrustedFriendsV2ConsentName
          : whoCanPartyWithMeV2ConsentName
        : shouldShowRemovedCommsCopy
          ? whoCanPartyWithMeTrustedFriendsConsentName
          : whoCanPartyWithMeConsentName,
      partySettingsSurface,
    );
  const [whoCanPartyWithMeParentSideContent, whoCanPartyWithMeParentSideActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanPartyWithMeParentSideRemovedCommsV2ConsentName
          : whoCanPartyWithMeParentSideV2ConsentName
        : shouldShowRemovedCommsCopy
          ? whoCanPartyWithMeParentSideRemovedCommsConsentName
          : whoCanPartyWithMeParentSideConsentName,
      partySettingsSurface,
    );
  const [whoCanUsePartyChatWithMeContent, whoCanUsePartyChatWithMeActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanUsePartyChatWithMeTrustedFriendsV2ConsentName
          : whoCanUsePartyChatWithMeV2ConsentName
        : shouldShowTFRestrictiveCommsCopy
          ? whoCanUsePartyChatWithMeTrustedFriendsConsentName
          : whoCanUsePartyChatWithMeConsentName,
      partySettingsSurface,
    );
  const [whoCanUsePartyChatWithMeParentSideContent, whoCanUsePartyChatWithMeParentSideActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanUsePartyChatWithMeParentSideTrustedFriendsV2ConsentName
          : whoCanUsePartyChatWithMeParentSideV2ConsentName
        : shouldShowTFRestrictiveCommsCopy
          ? whoCanUsePartyChatWithMeParentSideTrustedFriendsConsentName
          : whoCanUsePartyChatWithMeParentSideConsentName,
      partySettingsSurface,
    );
  const [whoCanUsePartyVoiceWithMeContent, whoCanUsePartyVoiceWithMeActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanUsePartyVoiceWithMeTrustedFriendsV2ConsentName
          : whoCanUsePartyVoiceWithMeV2ConsentName
        : shouldShowTFRestrictiveCommsCopy
          ? whoCanUsePartyVoiceWithMeTrustedFriendsConsentName
          : whoCanUsePartyVoiceWithMeConsentName,
      partySettingsSurface,
    );
  const [whoCanUsePartyVoiceWithMeParentSideContent, whoCanUsePartyVoiceWithMeParentSideActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      canSeeChatTerminology
        ? shouldShowRemovedCommsCopy
          ? whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2ConsentName
          : whoCanUsePartyVoiceWithMeParentSideV2ConsentName
        : shouldShowTFRestrictiveCommsCopy
          ? whoCanUsePartyVoiceWithMeParentSideTrustedFriendsConsentName
          : whoCanUsePartyVoiceWithMeParentSideConsentName,
      partySettingsSurface,
    );

  const partyContent = child?.userId
    ? whoCanPartyWithMeParentSideContent
    : whoCanPartyWithMeContent;
  const partyChatContent = child?.userId
    ? whoCanUsePartyChatWithMeParentSideContent
    : whoCanUsePartyChatWithMeContent;
  const partyVoiceContent = child?.userId
    ? whoCanUsePartyVoiceWithMeParentSideContent
    : whoCanUsePartyVoiceWithMeContent;

  const getAuditHeader = (setting: UserSetting): string => {
    if (child?.userId) {
      if (setting === UserSetting.whoCanPartyWithMe) {
        return whoCanPartyWithMeParentSideActions.getBase64EncodedAuditHeader();
      }
      if (setting === UserSetting.whoCanUsePartyChatWithMe) {
        return whoCanUsePartyChatWithMeParentSideActions.getBase64EncodedAuditHeader();
      }
      if (setting === UserSetting.whoCanUsePartyVoiceWithMe) {
        return whoCanUsePartyVoiceWithMeParentSideActions.getBase64EncodedAuditHeader();
      }
    } else {
      if (setting === UserSetting.whoCanPartyWithMe) {
        return whoCanPartyWithMeActions.getBase64EncodedAuditHeader();
      }
      if (setting === UserSetting.whoCanUsePartyChatWithMe) {
        return whoCanUsePartyChatWithMeActions.getBase64EncodedAuditHeader();
      }
      if (setting === UserSetting.whoCanUsePartyVoiceWithMe) {
        return whoCanUsePartyVoiceWithMeActions.getBase64EncodedAuditHeader();
      }
    }
    return "";
  };

  const invalidChildSettingsCache = () => {
    const invalidateAction = baseApi.util.invalidateTags([
      getChildSettingsCacheTag(child?.userId ?? authenticatedUser.id!),
    ]);
    dispatch(invalidateAction);
  };

  const [ageCheckRequiredModal, ageCheckRequiredModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.ageCheckRequiredModalTitle,
    bodyResourceId: privacyTranslationConstants.ageCheckRequiredModalDescription,
    actionButtonTextResourceId: commonTranslationConstants.ok,
    size: "sm",
    closeable: false,
    onAction: () => {
      invalidChildSettingsCache();
    },
  });

  const getRequiredActions = (setting: UserSetting, value: PartySettingsValue) =>
    consentRequirementsV2?.[setting]?.[optionToString(value)];

  const updateSetting = async (setting: UserSetting, value: PartySettingsValue) => {
    const requiredActions = getRequiredActions(setting, value);
    const requiresFae =
      requiredActions?.includes(RequirementType.FacialAgeEstimation) ||
      requiredActions?.includes(RequirementType.VpcForFae);

    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        await handleAgeCheckUpsells({ settingName: setting, optionValue: value, requiredActions });
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }

    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting,
      value,
      usePrologue: true,
      useRequirementsMapV2: true,
      auditHeader: getAuditHeader(setting),
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child?.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const autoUpdateReady = !!settingsAndOptions && !child?.userId;
  const whoCanPartyWithMeAutoUpdateModal = useAutoSettingUpdate(
    UserSetting.whoCanPartyWithMe,
    value => updateSetting(UserSetting.whoCanPartyWithMe, value as PartySettingsValue),
    autoUpdateReady,
    consentRequirementsV2,
    partyContent?.wordsOfConsent?.title,
  );
  const whoCanUsePartyChatWithMeAutoUpdateModal = useAutoSettingUpdate(
    UserSetting.whoCanUsePartyChatWithMe,
    value => updateSetting(UserSetting.whoCanUsePartyChatWithMe, value as PartySettingsValue),
    autoUpdateReady,
    consentRequirementsV2,
    partyChatContent?.wordsOfConsent?.title,
  );
  const whoCanUsePartyVoiceWithMeAutoUpdateModal = useAutoSettingUpdate(
    UserSetting.whoCanUsePartyVoiceWithMe,
    value => updateSetting(UserSetting.whoCanUsePartyVoiceWithMe, value as PartySettingsValue),
    autoUpdateReady,
    consentRequirementsV2,
    partyVoiceContent?.wordsOfConsent?.title,
  );

  const whoCanPartyWithMeOptions = useMemo(() => {
    let options = getWhoCanPartyWithMeOptions();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanPartyWithMe,
      options,
      settingsAndOptions?.[UserSetting.whoCanPartyWithMe]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  const whoCanUsePartyChatWithMeOptions = useMemo(() => {
    let options = getWhoCanUsePartyChatWithMeOptions();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanUsePartyChatWithMe,
      options,
      settingsAndOptions?.[UserSetting.whoCanUsePartyChatWithMe]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  const whoCanUsePartyVoiceWithMeOptions = useMemo(() => {
    let options = getWhoCanUsePartyVoiceWithMeOptions();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanUsePartyVoiceWithMe,
      options,
      settingsAndOptions?.[UserSetting.whoCanUsePartyVoiceWithMe]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  return (
    <React.Fragment>
      <SettingsSection description={partyContent?.wordsOfConsent?.pageDescription}>
        <React.Fragment>
          <RadioButtonOptionsWithParentalConsentV2
            title={partyContent?.wordsOfConsent?.title}
            description={partyContent?.wordsOfConsent?.consent}
            className="section-content"
            settingName={UserSetting.whoCanPartyWithMe}
            options={whoCanPartyWithMeOptions}
            onOptionSelected={(value: PartySettingsValue) =>
              updateSetting(UserSetting.whoCanPartyWithMe, value)
            }
            child={child}
            id="party-v2-privacy"
          />

          {(settingsAndOptions?.[UserSetting.whoCanUsePartyChatWithMe]?.options?.length ?? 0) >
            1 && (
            <RadioButtonOptionsWithParentalConsentV2
              title={partyChatContent?.wordsOfConsent?.title}
              description={partyChatContent?.wordsOfConsent?.consent}
              className="section-content"
              settingName={UserSetting.whoCanUsePartyChatWithMe}
              options={whoCanUsePartyChatWithMeOptions}
              onOptionSelected={(value: PartySettingsValue) =>
                updateSetting(UserSetting.whoCanUsePartyChatWithMe, value)
              }
              child={child}
              id="party-chat-privacy"
            />
          )}

          {(settingsAndOptions?.[UserSetting.whoCanUsePartyVoiceWithMe]?.options?.length ?? 0) >
            1 && (
            <RadioButtonOptionsWithParentalConsentV2
              title={partyVoiceContent?.wordsOfConsent?.title}
              description={partyVoiceContent?.wordsOfConsent?.consent}
              className="section-content"
              settingName={UserSetting.whoCanUsePartyVoiceWithMe}
              options={whoCanUsePartyVoiceWithMeOptions}
              onOptionSelected={(value: PartySettingsValue) =>
                updateSetting(UserSetting.whoCanUsePartyVoiceWithMe, value)
              }
              child={child}
              id="party-voice-privacy"
            />
          )}
        </React.Fragment>
      </SettingsSection>
      {errorModal}
      {ageCheckRequiredModal}
      {whoCanPartyWithMeAutoUpdateModal}
      {whoCanUsePartyChatWithMeAutoUpdateModal}
      {whoCanUsePartyVoiceWithMeAutoUpdateModal}
    </React.Fragment>
  );
};

PartySettingsV2.defaultProps = {
  child: undefined,
};

export default PartySettingsV2;
