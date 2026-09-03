import React, { useEffect, useState } from "react";
import { Toggle, Button } from "react-style-guide";

import { authenticatedUser } from "header-scripts";

import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import {
  TUpdateUserSettingValueRequest,
  TUserSettingAndOptions,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { ParentConsentType } from "../../../types/parentConsentsTypes";

import SettingOptionLockedPill from "./SettingOptionLockedPill";
import {
  booleanToOption,
  isOptionBlockedByConflictingInheritance,
  isOptionBlockedByParentalConsent,
  optionToBoolean,
} from "../../userSettings/utils/parentalControls/parentalConsentUtils";
import { useAppSelector } from "../../redux/hooks";
import { selectSettingConsentRequirements } from "../../apis/slices/parentalConsentSlice";
import useGetPendingParentalConsentRequest from "../../userSettings/hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModal from "../hooks/modals/useCancelConsentRequestModal";
import SettingOptionPendingPill from "./SettingOptionPendingPill";
import useGetSettingsAndOptions from "../../apis/hooks/useGetSettingsAndOptions";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";
import { useUpdateUserSettingValueMutation } from "../../apis/userSettingsApi";
import parentalControlsTranslationConstants from "../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import InlineUserInput from "./InlineUserInput";
import {
  disableBackLinkInterrupt,
  enableBackLinkInterrupt,
} from "../../userSettings/utils/backLinkUtils";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../userSettings/utils/successMessageUtils";
import privacyEventService from "../../userSettings/services/eventServices/privacyEventService";
import useWrappedTranslation from "../../userSettings/hooks/useWrappedTranslation";
/*
  A toggle component that potentially requires parental consent to change the setting

  Pass translated text to this component
*/
export const ToggleWithParentalConsent = ({
  label,
  inputId,
  settingName,
  childUserId,
  description,
  getAdditionalContent,
  auditHeader,
}: {
  label: string;
  inputId: string;
  settingName: UserSetting;
  childUserId?: number | undefined;
  description?: string | JSX.Element;
  getAdditionalContent?: (isToggleOn: boolean) => React.ReactNode;
  auditHeader?: string;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();

  const settingConsentRequirements = useAppSelector(
    selectSettingConsentRequirements(childUserId ?? authenticatedUser.id!),
  );

  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const [settingsAndOptions, settingsAndOptionsStatus] = useGetSettingsAndOptions(childUserId);

  const [isToggleOn, setIsToggleOn] = useState<boolean>(false);
  const [displayAskParentButton, setDisplayAskParentButton] = useState(false);

  // Whether there is a pending consent request for the user setting
  const pendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    settingName,
  );
  const pendingConsentValue = pendingConsent?.consentData?.[settingName];

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent,
    });

  const currOptionAsBoolean = optionToBoolean(
    (settingsAndOptions as Record<string, TUserSettingAndOptions<any>>)?.[settingName]
      ?.currentValue,
  );
  const oppositeOption = booleanToOption(!currOptionAsBoolean, settingName);

  // Whether the setting requires parental consent to toggle to the opposite option (i.e enabled -> disabled)
  const parentalConsentRequired = isOptionBlockedByParentalConsent(
    settingConsentRequirements,
    settingName,
    oppositeOption,
  );

  // Whether the setting is blocked by conflicting inheritance
  const optionBlockedByInheritance = isOptionBlockedByConflictingInheritance(
    settingConsentRequirements,
    settingName,
    oppositeOption,
  );

  const updateSettingValueHandler = async (newValue: boolean) => {
    const newSetting = booleanToOption(newValue, settingName);

    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId,
      setting: settingName,
      value: newSetting,
      auditHeader,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, childUserId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const onToggleHandler = async () => {
    if (pendingConsentValue) {
      cancelConsentRequestModalService.open();
      return;
    }
    if (parentalConsentRequired && !isToggleOn !== currOptionAsBoolean) {
      setIsToggleOn(toggleOn => !toggleOn);
      setDisplayAskParentButton(true);
      enableBackLinkInterrupt(async () => {
        await updateSettingValueHandler(!isToggleOn);
      }, settingName);
      return;
    }
    if (!isToggleOn === currOptionAsBoolean) {
      // Skip the network call and just update UI if the user toggles back to the previous db value they already had
      setIsToggleOn(!isToggleOn);
      disableBackLinkInterrupt();
    } else {
      await updateSettingValueHandler(!isToggleOn);
    }
    setDisplayAskParentButton(false);
  };

  useEffect(() => {
    if (settingsAndOptionsStatus === QueryStatus.fulfilled) {
      const settingAndOptionsForSettingName = (
        settingsAndOptions as Record<string, TUserSettingAndOptions<any>>
      )?.[settingName];
      const settingAsBoolean = optionToBoolean(settingAndOptionsForSettingName?.currentValue);
      disableBackLinkInterrupt();
      setIsToggleOn(settingAsBoolean);
      setDisplayAskParentButton(false);
    }
  }, [settingsAndOptions, settingName, settingsAndOptionsStatus]);

  return (
    <React.Fragment>
      <div className="section-content parental-consent-toggle-container">
        <InlineUserInput label={label}>
          <React.Fragment>
            <div id={inputId} className="parental-consent-toggle">
              {pendingConsentValue && <SettingOptionPendingPill />}
              {parentalConsentRequired && !pendingConsentValue && <SettingOptionLockedPill />}
              <Toggle
                isOn={isToggleOn}
                onToggle={onToggleHandler}
                isDisabled={optionBlockedByInheritance}
              />
            </div>
          </React.Fragment>
        </InlineUserInput>

        {description && <div className="small text">{description}</div>}

        {(displayAskParentButton || pendingConsentValue) && (
          <div className="request-consent-button-container">
            {/* Ask parent button */}
            {displayAskParentButton && !pendingConsentValue && (
              <Button
                className="ask-parent-button"
                variant={Button.variants.primary}
                onClick={async () => {
                  privacyEventService.authButtonClickSettingsAskMyParent(settingName);
                  await updateSettingValueHandler(isToggleOn);
                }}
              >
                {translate(parentalControlsTranslationConstants.parentalConsents.askMyParent)}
              </Button>
            )}

            {/* Cancel request button */}
            {pendingConsentValue && (
              <Button
                className="cancel-request-button"
                variant={Button.variants.secondary}
                onClick={() => cancelConsentRequestModalService.open()}
              >
                {translate(parentalControlsTranslationConstants.parentalConsents.cancelRequest)}
              </Button>
            )}
          </div>
        )}

        {/* Additional content provided by parent component */}
        {getAdditionalContent?.(isToggleOn)}
      </div>
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

ToggleWithParentalConsent.defaultProps = {
  childUserId: undefined,
  description: undefined,
  getAdditionalContent: undefined,
  auditHeader: undefined,
};

export default ToggleWithParentalConsent;
