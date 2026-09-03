import React, { useMemo } from "react";
import {
  UserPrivacyLevel,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { useGetFeatureAccessQuery } from "../../../apis/accessManagementApi";
import { Access } from "../../../../types/accessManagementTypes";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import {
  getGroupPartySettingOptions,
  getPartySettingOptions,
} from "../../constants/privacy/privacyConstants";
import RadioButtonOptionsWithParentalConsent from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import { filterRadioButtonOptions } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import birthdayUtils from "../../utils/birthdayUtils";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";

export const PartySettings = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const [settingsAndOptions] = useGetSettingsAndOptions(child?.userId);
  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: partyChatEnabledResult } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.PlatformChatUserMessagesAllowed,
  });
  const shouldShowRemovedCommsCopy = child?.userId
    ? child.shouldShowRemovedCommsCopy
    : uiPolicy?.shouldShowRemovedCommsCopy;

  const updatePartySetting = async (newPartySetting: UserPrivacyLevel) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.whoCanOneOnOnePartyWithMe,
      value: newPartySetting,
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

  const updateGroupPartySetting = async (newPartySetting: UserPrivacyLevel) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.whoCanGroupPartyWithMe,
      value: newPartySetting,
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

  const partyOptions = useMemo(() => {
    let options = getPartySettingOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.[UserSetting.whoCanOneOnOnePartyWithMe]?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const groupPartyOptions = useMemo(() => {
    let options = getGroupPartySettingOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.[UserSetting.whoCanGroupPartyWithMe]?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const getPartySettingDescription = () => {
    if (child?.userId) {
      return privacyTranslationConstants.partySettingDescriptionParentSideV2;
    }
    return privacyTranslationConstants.partySettingDescriptionV2;
  };

  const getGroupPartySettingDescription = () => {
    if (child?.userId) {
      return privacyTranslationConstants.groupPartySettingDescriptionParentSideV2;
    }
    return privacyTranslationConstants.groupPartySettingDescriptionV2;
  };

  const getDescription = () => {
    if (child?.userId) {
      if (shouldShowRemovedCommsCopy) {
        return translate(privacyTranslationConstants.removedCommsPartyParentSide);
      }
      const childAge = birthdayUtils.calculateAgeFromISO(child.birthDate);
      if (childAge >= 13 && child.isAgeChecked) {
        return translate(privacyTranslationConstants.partyDescriptionParentSideO13V2);
      }
      return translate(privacyTranslationConstants.partyDescriptionParentSideV2);
    }
    if (shouldShowRemovedCommsCopy) {
      return translate(privacyTranslationConstants.removedCommsPartyChildSide);
    }
    if (partyChatEnabledResult?.access === Access.Granted) {
      return translate(privacyTranslationConstants.partyDescriptionO13V2);
    }
    return translate(privacyTranslationConstants.partyDescriptionV2);
  };

  return (
    <SettingsSection description={getDescription()}>
      <React.Fragment>
        {/* 1:1 party setting */}
        <RadioButtonOptionsWithParentalConsent
          title={translate(privacyTranslationConstants.partyLabel)}
          description={translate(getPartySettingDescription())}
          className="section-content"
          settingName={UserSetting.whoCanOneOnOnePartyWithMe}
          options={partyOptions}
          onOptionSelected={updatePartySetting}
          childUserId={child?.userId}
          id="party-privacy"
        />

        {/* Group party setting  */}
        <RadioButtonOptionsWithParentalConsent
          title={translate(privacyTranslationConstants.groupPartyLabel)}
          description={translate(getGroupPartySettingDescription())}
          className="section-content"
          settingName={UserSetting.whoCanGroupPartyWithMe}
          options={groupPartyOptions}
          onOptionSelected={updateGroupPartySetting}
          childUserId={child?.userId}
          id="group-party-privacy"
        />
      </React.Fragment>
    </SettingsSection>
  );
};

PartySettings.defaultProps = {
  child: undefined,
};

export default PartySettings;
