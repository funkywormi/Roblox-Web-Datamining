import React, { useEffect, useState } from "react";
import { authenticatedUser } from "header-scripts";
import { Button } from "react-style-guide";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import ClassNames from "classnames";
import { Radio, RadioGroup } from "@rbx/foundation-ui";
import { TOptionValue, TUserSettingAndOptions, UserSetting } from "@rbx/user-settings";
import { ParentConsentType } from "../../../types/parentConsentsTypes";
import SettingOptionLockedPill from "./SettingOptionLockedPill";
import {
  isOptionBlockedByConflictingInheritance,
  isOptionBlockedByParentalConsent,
} from "../../userSettings/utils/parentalControls/parentalConsentUtils";
import { useAppSelector } from "../../redux/hooks";
import { selectSettingConsentRequirements } from "../../apis/slices/parentalConsentSlice";
import useGetPendingParentalConsentRequest from "../../userSettings/hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModal from "../hooks/modals/useCancelConsentRequestModal";
import SettingOptionPendingPill from "./SettingOptionPendingPill";
import useGetSettingsAndOptions from "../../apis/hooks/useGetSettingsAndOptions";
import {
  disableBackLinkInterrupt,
  enableBackLinkInterrupt,
} from "../../userSettings/utils/backLinkUtils";
import parentalControlsTranslationConstants from "../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import privacyEventService from "../../userSettings/services/eventServices/privacyEventService";
import useWrappedTranslation from "../../userSettings/hooks/useWrappedTranslation";

export type TRadioButtonOptionV2 = {
  label: string;
  value: TOptionValue;
  id: string;
  name?: string; // IMPORTANT: If multiple options share the same name on a page, only 1 will be selectable at a time
  description?: string;
};

/*
  A radio button component that potentially requires parental consent to select an option
*/
export const RadioButtonOptionsWithParentalConsent = ({
  options,
  settingName,
  onOptionSelected,
  className,
  childUserId,
  title,
  description,
  id,
}: {
  options: TRadioButtonOptionV2[];
  settingName: UserSetting;
  onOptionSelected: (value: any) => void;
  className?: string;
  childUserId?: number | undefined;
  title?: string | undefined;
  description?: string | JSX.Element | undefined;
  id?: string | undefined;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const [settingsAndOptions, settingsAndOptionsStatus] = useGetSettingsAndOptions(childUserId);
  const settingConsentRequirements = useAppSelector(
    selectSettingConsentRequirements(childUserId ?? authenticatedUser.id!),
  );

  // currentOption represents the value stored in the db (selectedOption could change without an API call if the option
  // is parent-restricted).
  const [currentOption, setCurrentOption] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<string>();
  const [displayAskParentButton, setDisplayAskParentButton] = useState(false);

  useEffect(() => {
    if (settingsAndOptionsStatus === QueryStatus.fulfilled) {
      const settingAndOptionsForSettingName = (
        settingsAndOptions as Record<string, TUserSettingAndOptions<any>>
      )?.[settingName];
      setCurrentOption(settingAndOptionsForSettingName?.currentValue);
      setSelectedOption(settingAndOptionsForSettingName?.currentValue);
      setDisplayAskParentButton(false);
      disableBackLinkInterrupt();
    }
  }, [settingsAndOptions, settingName, settingsAndOptionsStatus]);

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

  const setNewSettingValue = (selectedValue: string) => {
    const parentalConsentRequired = isOptionBlockedByParentalConsent(
      settingConsentRequirements,
      settingName,
      selectedValue,
    );

    if (pendingConsentValue && parentalConsentRequired) {
      cancelConsentRequestModalService.open();
      return;
    }
    setSelectedOption(selectedValue);
    if (parentalConsentRequired) {
      setDisplayAskParentButton(true);
      enableBackLinkInterrupt(() => {
        onOptionSelected(selectedValue);
      }, settingName);
      return;
    }
    setDisplayAskParentButton(false);
    disableBackLinkInterrupt();
    // If the user selects an option requiring parental consent then switches back to their stored db value,
    // we can skip the network call/success banner.
    if (selectedValue !== currentOption) {
      onOptionSelected(selectedValue);
    }
  };

  const radioButtons = options.map(option => {
    const parentalConsentRequired = isOptionBlockedByParentalConsent(
      settingConsentRequirements,
      settingName,
      option.value,
    );
    const optionBlockedByInheritance = isOptionBlockedByConflictingInheritance(
      settingConsentRequirements,
      settingName,
      option.value,
    );
    const optionHasPendingConsentRequest = pendingConsentValue === option.value;

    // Using tailwind classes here. The first string is existing css classes (none here), the rest are tailwind.
    const RadioButtonRowClassName = ClassNames("", "flex", "justify-between", "items-center");
    return (
      <div key={option.id} className={RadioButtonRowClassName}>
        <Radio
          label={translate(option.label)}
          data-testid={option.id}
          value={option.value as string}
          isDisabled={optionBlockedByInheritance}
          checked={option.value === selectedOption}
          hint={option.description}
        />
        {optionHasPendingConsentRequest && <SettingOptionPendingPill />}
        {parentalConsentRequired && !optionHasPendingConsentRequest && <SettingOptionLockedPill />}
      </div>
    );
  });

  // Using tailwind classes for many of these here. The first string is existing css classes, the rest are tailwind.
  // Exception for the variable being passed down here
  const radioBtnContainerClassName = ClassNames("radio-buttons-group", className);
  const radioButtonGroupClassName = ClassNames("", "margin-top-[5px]");
  const descriptionClassName = ClassNames(
    "small text radio-button-description",
    "margin-top-small",
  );

  return (
    <React.Fragment>
      <div className={radioBtnContainerClassName} data-testid="radio-buttons-group" id={id}>
        {title && <h4 className="radio-buttons-header font-header-2">{title}</h4>}
        <RadioGroup
          className={radioButtonGroupClassName}
          size="Medium"
          value={selectedOption}
          onValueChange={e => {
            setNewSettingValue(e);
          }}
        >
          {radioButtons}
        </RadioGroup>
        {description && <div className={descriptionClassName}>{description}</div>}

        <div className="request-consent-button-container">
          {/* Ask parent button */}
          {displayAskParentButton && !pendingConsentValue && (
            <Button
              className="ask-parent-button"
              variant={Button.variants.primary}
              onClick={() => {
                privacyEventService.authButtonClickSettingsAskMyParent(settingName);
                onOptionSelected(selectedOption);
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
      </div>
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

RadioButtonOptionsWithParentalConsent.defaultProps = {
  className: "",
  childUserId: undefined,
  title: undefined,
  description: undefined,
  id: undefined,
};

export default RadioButtonOptionsWithParentalConsent;
