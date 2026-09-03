import React, { useEffect, useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import {
  CrossAgeGroupCollaborationValue,
  RequirementType,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getStudioCollaborationOptions } from "../../constants/privacy/privacyConstants";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import { redirectQueryParam } from "../../utils/navigationUtils";
import { shouldDisplayInitialModal } from "../../utils/hybridViewUtils";
import baseApi from "../../../apis/common/baseApi";
import { getChildSettingsCacheTag } from "../../../apis/parentalControlsApi";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { studioCollaborationHelpPageUrl } from "../../constants/urlConstants";
import useStudioCollabPostFAEModal from "../../../common/hooks/modals/useStudioCollabPostFAEModal";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";

export const StudioCollaboration = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

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

  const shouldImmediatelyUpsellAgeVerificationRequirements = shouldDisplayInitialModal(
    redirectQueryParam.creatorCollaboration,
  );

  const getRequiredActions = (setting: UserSetting, value: CrossAgeGroupCollaborationValue) =>
    consentRequirementsV2?.[setting]?.[optionToString(value)];

  const [postFAEModal, triggerPostFAEModal] = useStudioCollabPostFAEModal();
  const updateStudioCollaboration = async (
    value: CrossAgeGroupCollaborationValue,
    isFromRedirect = false,
  ) => {
    const requiredActions = getRequiredActions(
      UserSetting.allowCrossAgeGroupStudioCollaboration,
      value,
    );
    const requiresFae =
      requiredActions?.includes(RequirementType.FacialAgeEstimation) ||
      requiredActions?.includes(RequirementType.VpcForFae);

    let ageCheckUpsellTriggered = false;
    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        ageCheckUpsellTriggered = await handleAgeCheckUpsells({
          settingName: UserSetting.allowCrossAgeGroupStudioCollaboration,
          optionValue: value,
          requiredActions,
          onComplete: triggerPostFAEModal,
        });
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }

    if (ageCheckUpsellTriggered) {
      // If age check upsells were triggered, VPC request/setting updates will be handled by triggerPostFAEModal
      return;
    }

    // If user came from a redirect (post-FAE flow from another page), trigger post-FAE modals
    // This handles the case where the user completed FAE on account info page and was redirected here
    if (isFromRedirect && !child?.userId) {
      triggerPostFAEModal();
      return;
    }

    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.allowCrossAgeGroupStudioCollaboration,
      value,
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

  useEffect(() => {
    if (shouldImmediatelyUpsellAgeVerificationRequirements && settingsAndOptions) {
      // eslint-disable-next-line no-void
      void updateStudioCollaboration(CrossAgeGroupCollaborationValue.OlderAgeGroupsAllowed, true);
    }
  }, [shouldImmediatelyUpsellAgeVerificationRequirements, settingsAndOptions]);

  const autoUpdateConfirmationModal = useAutoSettingUpdate(
    UserSetting.allowCrossAgeGroupStudioCollaboration,
    value => updateStudioCollaboration(value as CrossAgeGroupCollaborationValue),
    !!settingsAndOptions && !child?.userId,
    consentRequirementsV2,
    translate(privacyTranslationConstants.studioCollaborationLabel),
  );

  const studioCollaborationOptions = useMemo(() => {
    let options = getStudioCollaborationOptions();
    options = filterRadioButtonOptionsWithDescription(
      UserSetting.allowCrossAgeGroupStudioCollaboration,
      options,
      settingsAndOptions?.[UserSetting.allowCrossAgeGroupStudioCollaboration]?.options || [],
      translate,
      child?.userId,
    );
    return options;
  }, [settingsAndOptions, translate, child?.userId]);

  return (
    <React.Fragment>
      <SettingsSection
        description={
          <span
            dangerouslySetInnerHTML={{
              __html: translate(
                child?.userId
                  ? privacyTranslationConstants.parentSideStudioCollaborationDescription
                  : privacyTranslationConstants.studioCollaborationDescription,
                {
                  linkStart: `<a class="text-link" target="_blank" href=${studioCollaborationHelpPageUrl}>`,
                  linkEnd: `</a>`,
                },
              ),
            }}
          />
        }
      >
        <RadioButtonOptionsWithParentalConsentV2
          title={translate(privacyTranslationConstants.studioCollaborationLabel)}
          className="section-content"
          settingName={UserSetting.allowCrossAgeGroupStudioCollaboration}
          options={studioCollaborationOptions}
          onOptionSelected={updateStudioCollaboration}
          child={child}
          id="studio-collaboration"
        />
      </SettingsSection>
      {errorModal}
      {ageCheckRequiredModal}
      {postFAEModal}
      {autoUpdateConfirmationModal}
    </React.Fragment>
  );
};

StudioCollaboration.defaultProps = {
  child: undefined,
};

export default StudioCollaboration;
