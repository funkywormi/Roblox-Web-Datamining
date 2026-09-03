import React, { useMemo } from "react";
import {
  UserPrivacyLevel,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { Access } from "../../../../types/accessManagementTypes";
import RadioButtonOptionsWithParentalConsent from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import { filterRadioButtonOptions } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getPrivateServerPrivacyOptions } from "../../constants/privacy/privacyConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";
import { useGetFeatureAccessQuery } from "../../../apis/accessManagementApi";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";
import birthdayUtils from "../../utils/birthdayUtils";

// Who can join your private servers, and whose private servers you can join
export const PrivateServerPrivacy = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const [settingsAndOptions] = useGetSettingsAndOptions(child?.userId);
  const { data: coppaApplicableResult } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.IsCoppaApplicable,
  });

  const updatePrivateServerPrivacy = async (newPrivacyLevel: UserPrivacyLevel) => {
    try {
      const updateBody: TUpdateUserSettingValueRequest = {
        childUserId: child?.userId,
        setting: UserSetting.privateServerPrivacy,
        value: newPrivacyLevel,
      };
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

  const privateServerPrivacyOptions = useMemo(() => {
    let options = getPrivateServerPrivacyOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.privateServerPrivacy?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const getDescription = () => {
    if (child?.userId) {
      const childAge = birthdayUtils.calculateAgeFromISO(child.birthDate);
      return childAge < 13
        ? translate(privacyTranslationConstants.parentSidePrivateServerPrivacyDescription)
        : translate(privacyTranslationConstants.parentSidePrivateServerPrivacyDescriptionO13);
    }
    return coppaApplicableResult?.access === Access.Granted
      ? translate(privacyTranslationConstants.privateServerPrivacyDescription)
      : translate(privacyTranslationConstants.privateServerPrivacyDescriptionO13);
  };

  return (
    <SettingsSection description={translate(privacyTranslationConstants.privateServersDescription)}>
      <RadioButtonOptionsWithParentalConsent
        id="private-server-privacy"
        settingName={UserSetting.privateServerPrivacy}
        options={privateServerPrivacyOptions}
        className="section-content"
        childUserId={child?.userId}
        onOptionSelected={updatePrivateServerPrivacy}
        description={getDescription()}
      />
    </SettingsSection>
  );
};

PrivateServerPrivacy.defaultProps = {
  child: undefined,
};

export default PrivateServerPrivacy;
