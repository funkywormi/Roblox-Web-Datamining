import React, { useEffect, useState } from "react";
import { authenticatedUser } from "header-scripts";
import ClassNames from "classnames";
import { Radio, RadioGroup } from "@rbx/foundation-ui";
import { RequirementType, TUserSettingsAndOptionsV2, UserSetting } from "@rbx/user-settings";
import { ParentConsentType } from "../../../types/parentConsentsTypes";
import { TRadioButtonOptionV2 } from "./RadioButtonOptionsWithParentalConsent";
import { optionToString } from "../../userSettings/utils/parentalControls/parentalConsentUtils";
import { useAppSelector } from "../../redux/hooks";
import { selectSettingConsentRequirementsV2 } from "../../apis/slices/parentalConsentSlice";
import useGetPendingParentalConsentRequest from "../../userSettings/hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModalV2 from "../hooks/modals/useCancelConsentRequestModalV2";
import useGetSettingsAndOptionsV2 from "../../apis/hooks/useGetSettingsAndOptionsV2";
import { disableBackLinkInterrupt } from "../../userSettings/utils/backLinkUtils";
import privacyEventService from "../../userSettings/services/eventServices/privacyEventService";
import useWrappedTranslation from "../../userSettings/hooks/useWrappedTranslation";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import {
  hasInheritanceRequirement,
  hasParentalRequirement,
  hasRequirement,
} from "../../../core/utils/settingOptionsUtils";
import privacyTranslationConstants from "../../userSettings/constants/contentConstants/privacyTranslationConstants";
import parentalControlsEventService from "../../userSettings/services/eventServices/parentalControlsEventService";
import { TChildInfo } from "../../../types/childrenInfoTypes";
import eventService from "../../userSettings/services/eventServices/eventService";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

type RadioButtonOptionsWithParentalConsentV2Props = {
  options: TRadioButtonOptionV2[];
  settingName: UserSetting;
  onOptionSelected: (value: any) => void;
  className?: string;
  child?: TChildInfo | undefined;
  title?: string | undefined;
  description?: string | JSX.Element | undefined;
  id?: string | undefined;
};

/*
  A radio button component that potentially requires parental consent to select an option.
  This variant always relies on the V2 settings/options endpoint and invokes the upsell flow
  directly when a parent-restricted option is chosen.
*/
const RadioButtonOptionsWithParentalConsentV2 = ({
  options,
  settingName,
  onOptionSelected,
  className,
  child,
  title,
  description,
  id,
}: RadioButtonOptionsWithParentalConsentV2Props): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const canSeeChatTerminology = child?.userId
    ? (child?.canSeeChatTerminology ?? false)
    : (uiPolicy?.canSeeChatTerminology ?? false);
  const [settingsAndOptions, isLoading, isError, isFetching] = useGetSettingsAndOptionsV2(
    child?.userId,
  );
  const settingConsentRequirements = useAppSelector(
    selectSettingConsentRequirementsV2(child?.userId ?? authenticatedUser.id!),
  );

  // currentOption represents the value stored in the db (selectedOption could change without an API call if the option
  // is parent-restricted).
  const [currentOption, setCurrentOption] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<string>();

  useEffect(() => {
    if (!isFetching) {
      const settingAndOptionsForSettingName = (
        settingsAndOptions as Record<string, TUserSettingsAndOptionsV2<any>>
      )?.[settingName];
      setCurrentOption(settingAndOptionsForSettingName?.currentValue);
      setSelectedOption(settingAndOptionsForSettingName?.currentValue);
      disableBackLinkInterrupt();
    }
  }, [settingsAndOptions, settingName, isFetching]);

  // Whether there is a pending consent request for the user setting
  const settingPendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    settingName,
  );
  const ageCheckPendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    UserSetting.allowFacialAgeEstimation,
  );
  const optionsWithRequiredActions = settingConsentRequirements?.[settingName];
  let requireParentalConsentOnAgeCheck = false;
  Object.values(optionsWithRequiredActions ?? {}).forEach(requirements => {
    if (hasRequirement(requirements, [RequirementType.VpcForFae])) {
      requireParentalConsentOnAgeCheck = true;
    }
  });
  const pendingConsent = requireParentalConsentOnAgeCheck
    ? ageCheckPendingConsent
    : settingPendingConsent;
  const pendingConsentValue = requireParentalConsentOnAgeCheck
    ? ageCheckPendingConsent?.consentData?.[UserSetting.allowFacialAgeEstimation]
    : pendingConsent?.consentData?.[settingName];

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModalV2({
      pendingConsent,
      canSeeChatTerminology,
    });

  const setNewSettingValue = (selectedValue: string) => {
    if (child?.userId) {
      parentalControlsEventService.authButtonClickSettingsPControlsUpdateAttempt(
        {
          setting: settingName,
          value: selectedValue,
        },
        child,
      );
    } else {
      eventService.authButtonClickSettingsUpdateAttempt({
        setting: settingName,
        value: selectedValue,
      });
    }

    const requiredActions = settingConsentRequirements?.[settingName]?.[selectedValue];
    const parentalConsentRequired = hasParentalRequirement(requiredActions);

    if (pendingConsentValue && (parentalConsentRequired || requireParentalConsentOnAgeCheck)) {
      cancelConsentRequestModalService.open();
      return;
    }

    setSelectedOption(selectedValue);

    if (parentalConsentRequired) {
      privacyEventService.authButtonClickSettingsAskMyParent(settingName);
      onOptionSelected(selectedValue);
      return;
    }

    // If the user selects an option requiring parental consent then switches back to their stored db value,
    // we can skip the network call/success banner.
    if (selectedValue !== currentOption) {
      onOptionSelected(selectedValue);
    }
  };

  const radioButtons = options.map(option => {
    const optionValueString = optionToString(option.value);
    const requiredActions = settingConsentRequirements?.[settingName]?.[optionValueString];
    const optionBlockedByInheritance = hasInheritanceRequirement(requiredActions);
    const optionHasPendingConsentRequest = pendingConsentValue === option.value;
    const optionBlockedByVpcForFae =
      hasRequirement(requiredActions, [RequirementType.VpcForFae]) &&
      requireParentalConsentOnAgeCheck;
    const ageCheckPending = hasRequirement(requiredActions, [RequirementType.AgeCheckPending]);
    // Using tailwind classes here. The first string is existing css classes (none here), the rest are tailwind.
    const radioButtonRowClassName = ClassNames("", "flex", "justify-between", "items-center");
    const optionDescription =
      optionHasPendingConsentRequest || (optionBlockedByVpcForFae && pendingConsentValue)
        ? translate(commonTranslationConstants.hintText.vpcPending)
        : option.description;
    return (
      <div key={option.id} className={radioButtonRowClassName}>
        <Radio
          label={translate(option.label)}
          data-testid={option.id}
          value={option.value as string}
          isDisabled={optionBlockedByInheritance || ageCheckPending}
          checked={option.value === selectedOption}
          hint={optionDescription}
        />
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
          onValueChange={value => {
            setNewSettingValue(value);
          }}
        >
          {radioButtons}
        </RadioGroup>
        {description && <div className={descriptionClassName}>{description}</div>}
      </div>
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

RadioButtonOptionsWithParentalConsentV2.defaultProps = {
  className: "",
  child: undefined,
  title: undefined,
  description: undefined,
  id: undefined,
};

export default RadioButtonOptionsWithParentalConsentV2;
