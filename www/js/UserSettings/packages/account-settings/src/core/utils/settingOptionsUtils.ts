import { TranslateFunction } from "react-utilities";
import {
  RequirementType,
  TOptionValue,
  TSettingOptionAndRequirement,
  TSettingOptionWithActions,
  TUserSettingsAndOptionsV2,
  UserSetting,
} from "@rbx/user-settings";
import { TRadioButtonOptionV2 } from "../../react/common/components/RadioButtonOptionsWithParentalConsent";
import { TDropdownOption } from "../../types/commonTypes";
import commonTranslationConstants from "../../react/userSettings/constants/contentConstants/commonTranslationConstants";

const { hintText } = commonTranslationConstants;

const filterOptions = (
  allOptions: (TDropdownOption | TRadioButtonOptionV2)[],
  availableOptions: TSettingOptionAndRequirement[],
): (TDropdownOption | TRadioButtonOptionV2)[] => {
  return allOptions.filter((option: TDropdownOption | TRadioButtonOptionV2) =>
    availableOptions.some(
      (availableOption: TSettingOptionAndRequirement) =>
        availableOption.option.optionValue === option.value,
    ),
  );
};

const configureOptionDescription = (
  requiredActions: RequirementType[],
  translate: TranslateFunction,
  childUserId?: number,
): string | undefined => {
  if (requiredActions.length > 0) {
    let translatedString = "";
    const actions = new Set(requiredActions);
    if (actions.has(RequirementType.AgeCheckPending)) {
      // There is a pending age check that needs to be resolved
      translatedString = translate(hintText.faePending);
    } else if (
      actions.has(RequirementType.ParentalConsent) &&
      actions.has(RequirementType.FacialAgeEstimation)
    ) {
      // Both FAE and VPC are required for the setting change
      translatedString = childUserId
        ? translate(hintText.faeRequired)
        : translate(hintText.vpcAndFaeRequired);
    } else if (
      actions.has(RequirementType.FacialAgeEstimation) ||
      actions.has(RequirementType.IdVerification)
    ) {
      // Age estimation is required for the setting change
      translatedString = translate(hintText.faeRequired);
    } else if (actions.has(RequirementType.ParentalConsent)) {
      // Parental consent is required for the setting change
      translatedString = childUserId ? "" : translate(hintText.vpcRequired);
    }
    if (actions.has(RequirementType.VpcForFae)) {
      // VPC is required to enable FAE for the setting change
      translatedString = childUserId
        ? translate(hintText.faeRequired)
        : translate(hintText.vpcRequired);
    }
    return translatedString;
  }
  return undefined;
};

const filterOptionsWithDescription = (
  allOptions: TRadioButtonOptionV2[],
  availableOptions: TSettingOptionWithActions[],
  translate: TranslateFunction,
  childUserId?: number,
): TRadioButtonOptionV2[] => {
  return allOptions.filter((option: TRadioButtonOptionV2) =>
    availableOptions.some((availableOption: TSettingOptionWithActions) => {
      if (availableOption.option.optionValue === option.value) {
        const modifiedOption = option;
        // configure description text
        if (availableOption?.requiredActions) {
          const actionDescriptions = configureOptionDescription(
            availableOption.requiredActions,
            translate,
            childUserId,
          );
          modifiedOption.description = actionDescriptions;
        }
      }
      return availableOption.option.optionValue === option.value;
    }),
  );
};

export const filterDropdownOptions = (
  dropdownOptions: TDropdownOption[],
  availableOptions: TSettingOptionAndRequirement[],
): TDropdownOption[] => {
  return filterOptions(dropdownOptions, availableOptions) as TDropdownOption[];
};

export const filterRadioButtonOptions = (
  radioButtonOptions: TRadioButtonOptionV2[],
  availableOptions: TSettingOptionAndRequirement[],
): TRadioButtonOptionV2[] => {
  return filterOptions(radioButtonOptions, availableOptions) as TRadioButtonOptionV2[];
};

export const filterRadioButtonOptionsWithDescription = (
  settingName: UserSetting,
  radioButtonOptions: TRadioButtonOptionV2[],
  availableOptions: TSettingOptionWithActions[],
  translate: TranslateFunction,
  childUserId?: number,
): TRadioButtonOptionV2[] => {
  return filterOptionsWithDescription(radioButtonOptions, availableOptions, translate, childUserId);
};

export const hasRequirement = (
  requiredActions: RequirementType[] | undefined,
  targetActions: RequirementType[],
): boolean | undefined => {
  if (!requiredActions) {
    return undefined;
  }
  return requiredActions.some(action => targetActions.includes(action));
};

export const hasParentalRequirement = (
  requiredActions: RequirementType[] | undefined,
): boolean | undefined =>
  hasRequirement(requiredActions, [
    RequirementType.ParentalConsent,
    RequirementType.ParentConsentInherited,
    RequirementType.VpcForFae,
  ]);

export const hasInheritanceRequirement = (
  requiredActions: RequirementType[] | undefined,
): boolean | undefined =>
  hasRequirement(requiredActions, [
    RequirementType.Inherited,
    RequirementType.ParentConsentInherited,
  ]);

export const getRequiredActionsFromOptionsV2 = (
  settingOptions: TUserSettingsAndOptionsV2<TOptionValue> | undefined,
  optionValue: TOptionValue,
): RequirementType[] | undefined => {
  const option = settingOptions?.options?.find(opt => opt.option.optionValue === optionValue);
  return option?.requiredActions;
};
