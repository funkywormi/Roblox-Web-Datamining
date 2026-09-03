import React, { useEffect, useState } from "react";
import { Toggle, Button } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import {
  TUpdateUserSettingValueRequest,
  TUserSettingAndOptions,
  TOptionValue,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { ParentConsentType } from "../../../types/parentConsentsTypes";

import SettingOptionLockedPill from "./SettingOptionLockedPill";
import {
  booleanToOption,
  isOptionBlockedByParentalConsentV2,
  optionToBoolean,
} from "../../userSettings/utils/parentalControls/parentalConsentUtils";
import { useAppSelector } from "../../redux/hooks";
import { selectSettingConsentRequirementsV2 } from "../../apis/slices/parentalConsentSlice";
import useGetPendingParentalConsentRequest from "../../userSettings/hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModal from "../hooks/modals/useCancelConsentRequestModal";
import SettingOptionPendingPill from "./SettingOptionPendingPill";
import useGetSettingsAndOptionsV2 from "../../apis/hooks/useGetSettingsAndOptionsV2";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";
import { useUpdateUserSettingValueV2Mutation } from "../../apis/userSettingsApi";
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

export const ToggleWithParentalConsentV2 = ({
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
    selectSettingConsentRequirementsV2(childUserId ?? authenticatedUser.id!),
  );

  const [updateSettingValueV2] = useUpdateUserSettingValueV2Mutation();

  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2(childUserId);
  const status = !isLoading && !isError ? QueryStatus.fulfilled : QueryStatus.pending;
  const settingsAndOptionsStatus = status;

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
    (settingsAndOptions as Record<string, TUserSettingAndOptions<TOptionValue>>)?.[settingName]
      ?.currentValue ?? false,
  );

  const oppositeOption = booleanToOption(!currOptionAsBoolean, settingName);

  // Whether the setting requires parental consent to toggle to the opposite option (i.e enabled -> disabled)
  const parentalConsentRequired = isOptionBlockedByParentalConsentV2(
    settingConsentRequirements,
    settingName,
    oppositeOption,
  );

  // Whether the setting is blocked by conflicting inheritance
  // Note: V2 may need a separate function, but using the V1 version for now
  const optionBlockedByInheritance = false;

  const updateSettingValueHandler = async (newValue: boolean) => {
    try {
      const newSetting = booleanToOption(newValue, settingName);

      const updateBody: TUpdateUserSettingValueRequest = {
        childUserId,
        setting: settingName,
        value: newSetting,
        auditHeader,
      };
      const result = await updateSettingValueV2(updateBody).unwrap();
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
        settingsAndOptions as Record<string, TUserSettingAndOptions<TOptionValue>>
      )?.[settingName];
      const settingAsBoolean = optionToBoolean(
        settingAndOptionsForSettingName?.currentValue ?? false,
      );
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

ToggleWithParentalConsentV2.defaultProps = {
  childUserId: undefined,
  description: undefined,
  getAdditionalContent: undefined,
  auditHeader: undefined,
};

export default ToggleWithParentalConsentV2;
