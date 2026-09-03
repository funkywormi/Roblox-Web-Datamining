import React, { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import {
  UserPrivacyLevel,
  RequirementType,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import baseApi from "../../../apis/common/baseApi";
import {
  filterRadioButtonOptions,
  filterRadioButtonOptionsWithDescription,
} from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import RadioButtonOptionsWithParentalConsent from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import { getSocialNetworkVisibilityOptions } from "../../constants/privacy/privacyConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import { getChildSettingsCacheTag } from "../../../apis/parentalControlsApi";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getSuccessMessageKeyForUserSettingsUpdate } from "../../utils/successMessageUtils";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";

export const SocialNetworkVisibility = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const childUserId = child?.userId;
  const { translate } = useWrappedTranslation();
  const dispatch = useAppDispatch();
  const { snackbarService } = useSnackbar();
  const [settingsAndOptions] = useGetSettingsAndOptions(childUserId);
  const [settingsAndOptionsV2] = useGetSettingsAndOptionsV2(child?.userId);
  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const { socialNetworks } = accountInfoTranslationConstants;
  const { handleAgeCheckUpsells, errorModal } = useAgeVerificationUpsell();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const enforceAgeVerificationForSocialLinks =
    uiPolicy?.enforceAgeVerificationForSocialLinks ?? false;
  const consentRequirementsV2 = useAppSelector(
    selectSettingConsentRequirementsV2(child?.userId ?? authenticatedUser.id!),
  );

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

  const getRequiredActions = (setting: UserSetting, value: UserPrivacyLevel) =>
    consentRequirementsV2?.[setting]?.[optionToString(value)];

  const updateSocialLinksVisibility = async (newPrivacyLevel: UserPrivacyLevel) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId,
      setting: UserSetting.whoCanSeeMySocialNetworks,
      value: newPrivacyLevel,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const promptAgeVerification = async (newPrivacyLevel: UserPrivacyLevel) => {
    const requiredActions = getRequiredActions(
      UserSetting.whoCanSeeMySocialNetworks,
      newPrivacyLevel,
    );

    const requiresFae =
      requiredActions?.includes(RequirementType.FacialAgeEstimation) ||
      requiredActions?.includes(RequirementType.VpcForFae);

    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        const triggered = await handleAgeCheckUpsells({
          settingName: UserSetting.whoCanSeeMySocialNetworks,
          optionValue: newPrivacyLevel,
          requiredActions,
          onComplete: () => updateSocialLinksVisibility(newPrivacyLevel),
        });
        if (triggered) return;
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }

    await updateSocialLinksVisibility(newPrivacyLevel);
  };

  const autoUpdateConfirmationModal = useAutoSettingUpdate(
    UserSetting.whoCanSeeMySocialNetworks,
    value => promptAgeVerification(value as UserPrivacyLevel),
    !!settingsAndOptionsV2 && !child?.userId,
    consentRequirementsV2,
    translate(socialNetworks.socialNetworksVisibility),
  );

  const socialNetworkVisibilityOptions = useMemo(() => {
    let options = getSocialNetworkVisibilityOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.[UserSetting.whoCanSeeMySocialNetworks]?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const socialNetworkVisibilityOptionsWithDescription = useMemo(() => {
    let options = getSocialNetworkVisibilityOptions();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanSeeMySocialNetworks,
      options,
      settingsAndOptionsV2?.[UserSetting.whoCanSeeMySocialNetworks]?.options || [],
      translate,
      child?.userId,
    );

    return options;
  }, [settingsAndOptionsV2, translate, child?.userId]);

  if (enforceAgeVerificationForSocialLinks) {
    return (
      <React.Fragment>
        {errorModal}
        {ageCheckRequiredModal}
        {autoUpdateConfirmationModal}
        <RadioButtonOptionsWithParentalConsentV2
          title={childUserId ? translate(socialNetworks.socialNetworksVisibility) : ""}
          description={childUserId ? translate(socialNetworks.parentSideDescription) : ""}
          className="section-content"
          settingName={UserSetting.whoCanSeeMySocialNetworks}
          options={socialNetworkVisibilityOptionsWithDescription}
          child={child}
          onOptionSelected={promptAgeVerification}
        />
      </React.Fragment>
    );
  }

  return (
    <RadioButtonOptionsWithParentalConsent
      title={childUserId ? translate(socialNetworks.socialNetworksVisibility) : ""}
      description={childUserId ? translate(socialNetworks.parentSideDescription) : ""}
      className="section-content"
      settingName={UserSetting.whoCanSeeMySocialNetworks}
      options={socialNetworkVisibilityOptions}
      childUserId={childUserId}
      onOptionSelected={updateSocialLinksVisibility}
    />
  );
};

SocialNetworkVisibility.defaultProps = {
  childUserId: undefined,
};

export default SocialNetworkVisibility;
