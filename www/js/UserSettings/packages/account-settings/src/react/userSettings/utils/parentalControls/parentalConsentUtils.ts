import { localStorageService } from "core-roblox-utilities";
import {
  AllowedStatusValue,
  EnabledStatusValue,
  ContentControls,
  UpdateFriendsAboutMyActivitySettingValue,
  PhoneNumberDiscoverability,
  RequirementType,
  TOptionValue,
  TUserSettingsBody,
  UserSetting,
} from "@rbx/user-settings";
import {
  ParentConsentSettingName,
  ParentConsentType,
  TConsentResponse,
} from "../../../../types/parentConsentsTypes";
import {
  TSettingConsentRequirements,
  TSettingConsentRequirementsV2,
} from "../../../apis/slices/parentalConsentSlice";

// boolean values cannot be used as object keys, so we convert them to strings.
export const optionToString = (option: TOptionValue): string =>
  typeof option !== "string" ? option.toString() : option;

export const isParentConsentRequestInCooldown = (
  settingName: ParentConsentSettingName,
): boolean => {
  const cooldownKey = `Roblox.ParentalRequest.${settingName}CooldownExpirationTime`;
  const cooldownTimestamp = localStorageService.getLocalStorage(cooldownKey) as string | undefined;

  if (cooldownTimestamp) {
    const cooldownTime = new Date(cooldownTimestamp);
    const currentTime = new Date();
    return currentTime < cooldownTime;
  }
  return false;
};

export const clearParentConsentCooldown = (settingName: ParentConsentSettingName): void => {
  const cooldownKey = `Roblox.ParentalRequest.${settingName}CooldownExpirationTime`;
  localStorageService.removeLocalStorage(cooldownKey);
};

// There will always be only one setting in the consentData object, so we just get the first one
// since each consent request will always only be associated with 1 setting
export const getFirstSettingNameInConsentData = (
  consent: TConsentResponse,
): UserSetting | undefined => {
  if (consent.consentType === ParentConsentType.UpdateUserSetting) {
    return Object.keys(consent?.consentData || {})[0] as UserSetting;
  }
  return undefined;
};

export const getFirstSettingValueInConsentData = (
  consent: TConsentResponse,
): TUserSettingsBody[keyof TUserSettingsBody] | undefined => {
  if (consent.consentType === ParentConsentType.UpdateUserSetting) {
    return Object.values((consent?.consentData || {}) as TUserSettingsBody)[0];
  }
  return undefined;
};

export const optionToBoolean = (option: TOptionValue): boolean => {
  // TODO: Add other setting values that can be converted to boolean
  switch (option) {
    case PhoneNumberDiscoverability.Discoverable:
      return true;
    case PhoneNumberDiscoverability.NotDiscoverable:
      return false;
    case UpdateFriendsAboutMyActivitySettingValue.Yes:
      return true;
    case UpdateFriendsAboutMyActivitySettingValue.No:
      return false;
    case EnabledStatusValue.Enabled:
      return true;
    case EnabledStatusValue.Disabled:
      return false;
    case AllowedStatusValue.Allowed:
      return true;
    case AllowedStatusValue.Disallowed:
      return false;
    default:
      return false;
  }
};

export const booleanToOption = (value: boolean, settingName: UserSetting): TOptionValue => {
  // TODO: Add other setting values that can be converted to boolean
  switch (settingName) {
    case UserSetting.phoneNumberDiscoverability:
      return value
        ? PhoneNumberDiscoverability.Discoverable
        : PhoneNumberDiscoverability.NotDiscoverable;
    case UserSetting.updateFriendsAboutMyActivity:
      return value
        ? UpdateFriendsAboutMyActivitySettingValue.Yes
        : UpdateFriendsAboutMyActivitySettingValue.No;
    case UserSetting.allowThirdPartyAppPermissions:
    case UserSetting.enablePurchases:
      return value ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled;
    case UserSetting.allowVoiceDataUsage:
      return value ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled;
    case UserSetting.allowEnableEmailNotifications:
    case UserSetting.allowEnableExperienceNotifications:
    case UserSetting.allowEnableGroupNotifications:
    case UserSetting.allowEnablePushNotifications:
      return value ? AllowedStatusValue.Allowed : AllowedStatusValue.Disallowed;
    case UserSetting.doNotDisturb:
      return value ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled;
    case UserSetting.allowSensitiveIssues:
    case UserSetting.allowFacialAgeEstimation:
      return value ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled;
    case UserSetting.aggregatedDesktopNotifications:
      return value ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled;
    default:
      return value;
  }
};

/**
 * Checks if an option requires a specific type of consent or is blocked by a conflicting inherited setting.
 *
 * @param settingConsentRequirements - The consent requirements for the settings.
 * @param settingName - The name of the setting.
 * @param value - The value of the option.
 * @param requirementType - The type of requirement to check for.
 * @returns True if the option meets the specified requirement type, false otherwise.
 */
const checkOptionRequirement = (
  settingConsentRequirements: TSettingConsentRequirements | undefined,
  settingName: UserSetting,
  value: TOptionValue | undefined,
  requirementType: RequirementType,
): boolean => {
  const options = settingConsentRequirements?.[settingName] ?? {};
  if (value) {
    const valueString = optionToString(value);
    const requirement: RequirementType = options?.[valueString] ?? RequirementType.None;
    return requirement === requirementType;
  }

  return false;
};

const checkOptionRequirementV2 = (
  settingConsentRequirements: TSettingConsentRequirementsV2 | undefined,
  settingName: UserSetting,
  value: TOptionValue | undefined,
  requirementTypes: RequirementType[],
): boolean => {
  const options = settingConsentRequirements?.[settingName] ?? {};
  if (value) {
    const valueString = optionToString(value);
    const requirements: RequirementType[] = options?.[valueString] ?? [];
    // make sure all requirmentTypes and requirements are equal
    return (
      requirementTypes.every(requirementType => requirements.includes(requirementType)) &&
      requirements.every(requirementType => requirementTypes.includes(requirementType))
    );
  }

  return false;
};

export const isRestrictedOptionBlockedByContentAgeVerification = (
  settingConsentRequirements: TSettingConsentRequirements | undefined,
): boolean =>
  checkOptionRequirement(
    settingConsentRequirements,
    UserSetting.contentAgeRestriction,
    ContentControls.SeventeenPlus,
    RequirementType.ContentAgeRestrictionVerification,
  );

// Checks if an option requires parental consent
export const isOptionBlockedByParentalConsent = (
  settingConsentRequirements: TSettingConsentRequirements | undefined,
  settingName: UserSetting,
  value: TOptionValue | undefined,
): boolean =>
  checkOptionRequirement(
    settingConsentRequirements,
    settingName,
    value,
    RequirementType.ParentalConsent,
  ) ||
  checkOptionRequirement(
    settingConsentRequirements,
    settingName,
    value,
    RequirementType.ParentConsentInherited,
  );
export const isOptionBlockedByParentalConsentV2 = (
  settingConsentRequirements: TSettingConsentRequirementsV2 | undefined,
  settingName: UserSetting,
  value: TOptionValue | undefined,
): boolean =>
  checkOptionRequirementV2(settingConsentRequirements, settingName, value, [
    RequirementType.ParentalConsent,
  ]) ||
  checkOptionRequirementV2(settingConsentRequirements, settingName, value, [
    RequirementType.ParentConsentInherited,
  ]);
// Checks if an option is blocked due to a conflicting inherited setting.
// This occurs when the option requires certain options from a different setting to be selected.
export const isOptionBlockedByConflictingInheritance = (
  settingConsentRequirements: TSettingConsentRequirements | undefined,
  settingName: UserSetting,
  value: TOptionValue | undefined,
): boolean =>
  checkOptionRequirement(
    settingConsentRequirements,
    settingName,
    value,
    RequirementType.Inherited,
  ) ||
  checkOptionRequirement(
    settingConsentRequirements,
    settingName,
    value,
    RequirementType.ParentConsentInherited,
  );
