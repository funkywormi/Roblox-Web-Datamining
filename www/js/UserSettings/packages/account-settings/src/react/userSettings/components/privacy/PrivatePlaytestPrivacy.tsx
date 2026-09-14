import React, { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import {
  PrivatePlaytestValue,
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
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import { optionToString } from "../../utils/parentalControls/parentalConsentUtils";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getPrivatePlaytestOptions } from "../../constants/privacy/privacyConstants";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import baseApi from "../../../apis/common/baseApi";
import { getChildSettingsCacheTag } from "../../../apis/parentalControlsApi";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";

export const PrivatePlaytestPrivacy = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  const [settingsAndOptions] = useGetSettingsAndOptionsV2(child?.userId);
  const [updateSettingValue] = useUpdateUserSettingValueV2Mutation();
  const { handleAgeCheckUpsells, errorModal } = useAgeVerificationUpsell();
  const consentRequirementsV2 = useAppSelector(
    selectSettingConsentRequirementsV2(child?.userId ?? authenticatedUser.id!),
  );

  const invalidateChildSettingsCache = () => {
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
      invalidateChildSettingsCache();
    },
  });

  const getRequiredActions = (setting: UserSetting, value: PrivatePlaytestValue) =>
    consentRequirementsV2?.[setting]?.[optionToString(value)];

  const persistPrivatePlaytest = async (value: PrivatePlaytestValue) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.privatePlaytest,
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

  const updatePrivatePlaytest = async (value: PrivatePlaytestValue) => {
    const requiredActions = getRequiredActions(UserSetting.privatePlaytest, value);
    const requiresFae =
      requiredActions?.includes(RequirementType.FacialAgeEstimation) ||
      requiredActions?.includes(RequirementType.VpcForFae);

    if (requiredActions && requiredActions.length > 0) {
      if (!child?.userId) {
        const triggered = await handleAgeCheckUpsells({
          settingName: UserSetting.privatePlaytest,
          optionValue: value,
          requiredActions,
          onComplete: () => persistPrivatePlaytest(value),
        });
        if (triggered) return;
      } else if (requiresFae) {
        ageCheckRequiredModalService.open();
        return;
      }
    }

    await persistPrivatePlaytest(value);
  };

  const autoUpdateConfirmationModal = useAutoSettingUpdate(
    UserSetting.privatePlaytest,
    value => updatePrivatePlaytest(value as PrivatePlaytestValue),
    !!settingsAndOptions && !child?.userId,
    consentRequirementsV2,
    translate(privacyTranslationConstants.privatePlaytestLabel),
  );

  const privatePlaytestOptions = useMemo(() => {
    return filterRadioButtonOptionsWithDescription(
      UserSetting.privatePlaytest,
      getPrivatePlaytestOptions(),
      settingsAndOptions?.[UserSetting.privatePlaytest]?.options || [],
      translate,
      child?.userId,
    );
  }, [settingsAndOptions, translate, child?.userId]);

  return (
    <React.Fragment>
      <SettingsSection>
        <RadioButtonOptionsWithParentalConsentV2
          title={translate(privacyTranslationConstants.privatePlaytestLabel)}
          description={translate(
            child?.userId
              ? privacyTranslationConstants.parentSidePrivatePlaytestDescription
              : privacyTranslationConstants.privatePlaytestDescription,
          )}
          className="section-content"
          settingName={UserSetting.privatePlaytest}
          options={privatePlaytestOptions}
          onOptionSelected={updatePrivatePlaytest}
          child={child}
          id="private-playtest"
        />
      </SettingsSection>
      {errorModal}
      {ageCheckRequiredModal}
      {autoUpdateConfirmationModal}
    </React.Fragment>
  );
};

PrivatePlaytestPrivacy.defaultProps = {
  child: undefined,
};

export default PrivatePlaytestPrivacy;
