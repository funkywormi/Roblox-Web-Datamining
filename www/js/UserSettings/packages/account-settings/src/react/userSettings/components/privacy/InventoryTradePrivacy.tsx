import React, { useMemo } from "react";
import {
  ChallengeAbandonedError,
  UserPrivacyLevel,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import SettingsSection from "../../../common/components/SettingsSection";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import {
  getInventoryVisibilityOptions,
  getTradePrivacyOptions,
} from "../../constants/privacy/privacyConstants";
import RadioButtonOptionsWithParentalConsent from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import { filterRadioButtonOptions } from "../../../../core/utils/settingOptionsUtils";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";

export const InventoryTradePrivacy = ({ childUserId }: { childUserId?: number }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const [settingsAndOptions] = useGetSettingsAndOptions(childUserId);

  const updateInventoryVisibility = async (newPrivacyLevel: UserPrivacyLevel) => {
    try {
      const updateBody: TUpdateUserSettingValueRequest = {
        childUserId,
        setting: UserSetting.whoCanSeeMyInventory,
        value: newPrivacyLevel,
      };
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      // Ignore challenge abandons for errors.
      if (error !== ChallengeAbandonedError) {
        const errorKey = handleChildSettingsUpdateError(error, childUserId);
        if (errorKey) {
          snackbarService.warning(translate(errorKey));
        }
      }
    }
  };

  const updateTradePrivacy = async (newPrivacyLevel: UserPrivacyLevel) => {
    try {
      const updateBody: TUpdateUserSettingValueRequest = {
        childUserId,
        setting: UserSetting.whoCanTradeWithMe,
        value: newPrivacyLevel,
      };
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      // Ignore challenge abandons for errors.
      if (error !== ChallengeAbandonedError) {
        const errorKey = handleChildSettingsUpdateError(error, childUserId);
        if (errorKey) {
          snackbarService.warning(translate(errorKey));
        }
      }
    }
  };

  const inventoryVisibilityOptions = useMemo(() => {
    let options = getInventoryVisibilityOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.[UserSetting.whoCanSeeMyInventory]?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const tradePrivacyOptions = useMemo(() => {
    let options = getTradePrivacyOptions();
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.[UserSetting.whoCanTradeWithMe]?.options || [],
    );
    return options;
  }, [settingsAndOptions]);

  const description = (
    <span>
      {translate(privacyTranslationConstants.tradingAndInventoryDescription)}
      {settingsAndOptions?.[UserSetting.whoCanTradeWithMe] && (
        <span>
          &nbsp;
          {translate(privacyTranslationConstants.inheritedSettingsDescription)}
        </span>
      )}
    </span>
  );

  return (
    <SettingsSection description={description}>
      <React.Fragment>
        <RadioButtonOptionsWithParentalConsent
          title={translate(privacyTranslationConstants.inventoryVisibilityLabel)}
          settingName={UserSetting.whoCanSeeMyInventory}
          options={inventoryVisibilityOptions}
          className="section-content"
          childUserId={childUserId}
          onOptionSelected={updateInventoryVisibility}
        />
        {settingsAndOptions?.[UserSetting.whoCanTradeWithMe] && (
          <RadioButtonOptionsWithParentalConsent
            title={translate(privacyTranslationConstants.tradingLabel)}
            settingName={UserSetting.whoCanTradeWithMe}
            options={tradePrivacyOptions}
            className="section-content"
            childUserId={childUserId}
            onOptionSelected={updateTradePrivacy}
            description={translate(
              childUserId
                ? privacyTranslationConstants.parentSideTradingDescription
                : privacyTranslationConstants.tradingDescription,
            )}
          />
        )}
      </React.Fragment>
    </SettingsSection>
  );
};

InventoryTradePrivacy.defaultProps = {
  childUserId: undefined,
};

export default InventoryTradePrivacy;
