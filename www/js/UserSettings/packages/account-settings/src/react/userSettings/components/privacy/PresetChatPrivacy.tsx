import React, { useMemo } from "react";
import { useTranslation } from "react-utilities";
import {
  EnabledStatusValue,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import SettingsSection from "../../../common/components/SettingsSection";
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getPresetChatOptions } from "../../constants/privacy/privacyConstants";
import { presetChatHelpPageUrl } from "../../constants/urlConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";
import { TChildSettingsInfo } from "../../../../types/childrenInfoTypes";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { TSettingUpdateProps } from "../../../../types/settingUpdateTypes";

export const PresetChatPrivacy = ({
  child,
  onUpdateSetting,
}: { child?: TChildSettingsInfo } & TSettingUpdateProps): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const shouldShowRestrictivePresetChatSetting = child?.userId
    ? child.shouldShowRestrictivePresetChatSetting
    : uiPolicy?.shouldShowRestrictivePresetChatSetting;
  const [settingsAndOptions, , , , consentRequirementsV2] = useGetSettingsAndOptionsV2(
    child?.userId,
  );
  const [updateSettingValue] = useUpdateUserSettingValueV2Mutation();

  const updatePresetChat = async (newValue: EnabledStatusValue) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting: UserSetting.allowPresetChat,
      value: newValue,
      usePrologue: true,
      useRequirementsMapV2: true,
    };
    try {
      if (onUpdateSetting) {
        await onUpdateSetting(updateBody);
        return;
      }
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

  const presetChatOptions = useMemo(() => {
    return filterRadioButtonOptionsWithDescription(
      UserSetting.allowPresetChat,
      getPresetChatOptions(),
      settingsAndOptions?.[UserSetting.allowPresetChat]?.options || [],
      translate,
      child?.userId,
    );
  }, [settingsAndOptions, translate, child?.userId]);

  const autoUpdateConfirmationModal = useAutoSettingUpdate(
    UserSetting.allowPresetChat,
    value => updatePresetChat(value as EnabledStatusValue),
    !!settingsAndOptions && !child?.userId,
    consentRequirementsV2,
    translate(privacyTranslationConstants.presetChatLabel),
  );

  const description = (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(
          child?.userId
            ? privacyTranslationConstants.parentSidePresetChatDescription
            : privacyTranslationConstants.presetChatDescription,
          {
            linkStart: `<a class="text-link" href=${presetChatHelpPageUrl} target="_blank" rel="noreferrer">`,
            linkEnd: "</a>",
          },
        ),
      }}
    />
  );

  return (
    <React.Fragment>
      <SettingsSection description={description}>
        <RadioButtonOptionsWithParentalConsentV2
          title={translate(privacyTranslationConstants.presetChatLabel)}
          description={translate(
            shouldShowRestrictivePresetChatSetting
              ? privacyTranslationConstants.restrictivePresetChatSubtitle
              : privacyTranslationConstants.presetChatSubtitle,
          )}
          settingName={UserSetting.allowPresetChat}
          className="section-content"
          options={presetChatOptions}
          onOptionSelected={updatePresetChat}
          child={child}
          id="preset-chat-setting"
        />
      </SettingsSection>
      {autoUpdateConfirmationModal}
    </React.Fragment>
  );
};

PresetChatPrivacy.defaultProps = {
  child: undefined,
};

export default PresetChatPrivacy;
