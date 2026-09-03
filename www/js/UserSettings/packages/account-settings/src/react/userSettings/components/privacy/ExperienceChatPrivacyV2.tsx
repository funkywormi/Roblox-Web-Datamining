import React, { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import {
  UserPrivacyLevel,
  RequirementType,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import baseApi from "../../../apis/common/baseApi";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import {
  getExperienceChatOptionsV2,
  getExperienceDirectChatOptionsV2,
} from "../../constants/privacy/privacyConstants";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import { getChildSettingsCacheTag } from "../../../apis/parentalControlsApi";
import { experienceChatHelpPageUrl } from "../../constants/urlConstants";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";
import {
  canSeeExperienceChatRow,
  hasDirectChatSetting,
  hasExperienceChatSetting,
} from "../../utils/experienceChatVisibilityUtils";

export const ExperienceChatPrivacyV2 = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const shouldShowTFRestrictiveCommsCopy = child?.userId
    ? child.shouldShowTFRestrictiveCommsCopy
    : uiPolicy?.shouldShowTFRestrictiveCommsCopy;
  const dispatch = useAppDispatch();

  const { snackbarService } = useSnackbar();
  const [settingsAndOptions] = useGetSettingsAndOptionsV2(child?.userId);
  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const { handleAgeCheckUpsells, errorModal } = useAgeVerificationUpsell();
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

  const updateExperienceChatPrivacy = async (newPrivacyLevel: UserPrivacyLevel) => {
    const requiredActions = getRequiredActions(
      UserSetting.whoCanChatWithMeInExperiences,
      newPrivacyLevel,
    );
    const requiresFae =
      requiredActions?.includes(RequirementType.FacialAgeEstimation) ||
      requiredActions?.includes(RequirementType.VpcForFae);
    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        await handleAgeCheckUpsells({
          settingName: UserSetting.whoCanChatWithMeInExperiences,
          optionValue: newPrivacyLevel,
          requiredActions,
        });
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.whoCanChatWithMeInExperiences,
      value: newPrivacyLevel,
      usePrologue: true,
      useRequirementsMapV2: true,
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

  const updateExperienceDirectChatPrivacy = async (newPrivacyLevel: UserPrivacyLevel) => {
    const requiredActions = getRequiredActions(
      UserSetting.whoCanWhisperChatWithMeInExperiences,
      newPrivacyLevel,
    );
    const requiresFae = requiredActions?.includes(RequirementType.FacialAgeEstimation);
    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        await handleAgeCheckUpsells({
          settingName: UserSetting.whoCanWhisperChatWithMeInExperiences,
          optionValue: newPrivacyLevel,
          requiredActions,
        });
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.whoCanWhisperChatWithMeInExperiences,
      value: newPrivacyLevel,
      usePrologue: true,
      useRequirementsMapV2: true,
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

  // Readiness is per setting: a deep link names the setting to update, and a setting omitted
  // from /settings-and-options must not be updated even once the response itself has loaded.
  const autoUpdateReady = !!settingsAndOptions && !child?.userId;
  const whoCanChatWithMeInExperiencesAutoUpdateModal = useAutoSettingUpdate(
    UserSetting.whoCanChatWithMeInExperiences,
    value => updateExperienceChatPrivacy(value as UserPrivacyLevel),
    autoUpdateReady && hasExperienceChatSetting(settingsAndOptions),
    consentRequirementsV2,
    translate(privacyTranslationConstants.experienceChatLabel),
  );

  const whoCanWhisperChatWithMeInExperiencesAutoUpdateModal = useAutoSettingUpdate(
    UserSetting.whoCanWhisperChatWithMeInExperiences,
    value => updateExperienceDirectChatPrivacy(value as UserPrivacyLevel),
    autoUpdateReady && hasDirectChatSetting(settingsAndOptions),
    consentRequirementsV2,
    translate(privacyTranslationConstants.directChatLabel),
  );

  const experienceChatPrivacyOptions = useMemo(() => {
    let options = getExperienceChatOptionsV2();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanChatWithMeInExperiences,
      options,
      settingsAndOptions?.[UserSetting.whoCanChatWithMeInExperiences]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  const experienceDirectChatPrivacyOptions = useMemo(() => {
    let options = getExperienceDirectChatOptionsV2();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.whoCanWhisperChatWithMeInExperiences,
      options,
      settingsAndOptions?.[UserSetting.whoCanWhisperChatWithMeInExperiences]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  const showExperienceChatRow = canSeeExperienceChatRow({ settingsAndOptions, child });
  const showDirectChatRow = hasDirectChatSetting(settingsAndOptions);
  const disclaimerResourceId = (() => {
    if (showExperienceChatRow && showDirectChatRow) {
      return privacyTranslationConstants.experienceChatDisclaimer;
    }
    return showExperienceChatRow
      ? privacyTranslationConstants.experienceChatOnlyDisclaimer
      : privacyTranslationConstants.directChatOnlyDisclaimer;
  })();
  const parentSideExperienceChatDescription = (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(
          shouldShowTFRestrictiveCommsCopy
            ? privacyTranslationConstants.tfRestrictedExperienceChatPageParentSide
            : privacyTranslationConstants.parentSideExperienceChatDescriptionV2,
          {
            linkStart: `<a class="text-link" href=${experienceChatHelpPageUrl} target="_blank" rel="noreferrer">`,
            linkEnd: "</a>",
          },
        ),
      }}
    />
  );
  const childSideExperienceChatDescription = (
    <span>
      {translate(
        shouldShowTFRestrictiveCommsCopy
          ? privacyTranslationConstants.tfRestrictedExperienceChatChildSide
          : privacyTranslationConstants.experienceChatSettingDescriptionV2,
      )}{" "}
      <a className="text-link" href={experienceChatHelpPageUrl} target="_blank" rel="noreferrer">
        {translate(parentalControlsTranslationConstants.perExperienceScreentime.viewDetailsButton)}
      </a>
    </span>
  );

  return (
    <React.Fragment>
      <SettingsSection
        description={
          child?.userId ? parentSideExperienceChatDescription : childSideExperienceChatDescription
        }
      >
        <React.Fragment>
          {/* Experience chat privacy setting */}
          {showExperienceChatRow && (
            <RadioButtonOptionsWithParentalConsentV2
              title={translate(privacyTranslationConstants.experienceChatLabel)}
              description={translate(
                child?.userId
                  ? shouldShowTFRestrictiveCommsCopy
                    ? privacyTranslationConstants.tfRestrictedExperienceChatSettingParentSide
                    : privacyTranslationConstants.parentSideExperienceChatSettingDescriptionV2
                  : shouldShowTFRestrictiveCommsCopy
                    ? privacyTranslationConstants.tfRestrictedExperienceChatChildSide
                    : privacyTranslationConstants.experienceChatSettingDescriptionV2,
              )}
              className="section-content"
              settingName={UserSetting.whoCanChatWithMeInExperiences}
              options={experienceChatPrivacyOptions}
              onOptionSelected={updateExperienceChatPrivacy}
              child={child}
              id="experience-chat-privacy"
            />
          )}

          {/* Experience whisper/direct chat privacy setting */}
          {showDirectChatRow && (
            <RadioButtonOptionsWithParentalConsentV2
              title={translate(privacyTranslationConstants.directChatLabel)}
              description={translate(
                child?.userId
                  ? shouldShowTFRestrictiveCommsCopy
                    ? privacyTranslationConstants.tfRestrictedDirectChatSettingParentSide
                    : privacyTranslationConstants.parentSideDirectChatDescriptionV2
                  : shouldShowTFRestrictiveCommsCopy
                    ? privacyTranslationConstants.tfRestrictedDirectChatChildSide
                    : privacyTranslationConstants.directChatDescriptionV2,
              )}
              className="section-content"
              settingName={UserSetting.whoCanWhisperChatWithMeInExperiences}
              options={experienceDirectChatPrivacyOptions}
              onOptionSelected={updateExperienceDirectChatPrivacy}
              child={child}
              id="experience-direct-chat-privacy"
            />
          )}
          {(showExperienceChatRow || showDirectChatRow) && (
            <div className="small text experience-chat-disclaimer">
              {translate(disclaimerResourceId)}
            </div>
          )}
        </React.Fragment>
      </SettingsSection>
      {errorModal}
      {ageCheckRequiredModal}
      {whoCanChatWithMeInExperiencesAutoUpdateModal}
      {whoCanWhisperChatWithMeInExperiencesAutoUpdateModal}
    </React.Fragment>
  );
};

ExperienceChatPrivacyV2.defaultProps = {
  child: undefined,
};

export default ExperienceChatPrivacyV2;
