import { FormFieldStatus } from '../../common/types/signupTypes';

export type IsSignupFormValidInput = {
  birthdayStatus: FormFieldStatus;
  usernameStatus: FormFieldStatus;
  passwordStatus: FormFieldStatus;
  emailStatus: FormFieldStatus;
  isKoreaEmailRequired: boolean;
  isVerifiedParentConsentSignup: boolean;
  isVerifiedParentConsentTokenInvalid: boolean;
  shouldEnableKoreaEnhancedCompliance: boolean;
  isSignupCheckboxEnabled: boolean;
  shouldDisableSignupCheckbox: boolean;
  shouldEnableStrictCompliance: boolean;
  isTosChecked: boolean;
  isPrivacyPolicyChecked: boolean;
};

/**
 * Applies the production signup form-validity gates without reading React
 * state. Regional applicability (for example whether Korea ID email is
 * required for the current birthday) is resolved by the caller.
 */
export const isSignupFormValid = ({
  birthdayStatus,
  usernameStatus,
  passwordStatus,
  emailStatus,
  isKoreaEmailRequired,
  isVerifiedParentConsentSignup,
  isVerifiedParentConsentTokenInvalid,
  shouldEnableKoreaEnhancedCompliance,
  isSignupCheckboxEnabled,
  shouldDisableSignupCheckbox,
  shouldEnableStrictCompliance,
  isTosChecked,
  isPrivacyPolicyChecked
}: IsSignupFormValidInput): boolean => {
  if (isKoreaEmailRequired && emailStatus !== FormFieldStatus.Valid) {
    return false;
  }

  if (isVerifiedParentConsentSignup) {
    return birthdayStatus === FormFieldStatus.Valid && !isVerifiedParentConsentTokenInvalid;
  }

  let agreementsChecked = true;
  if (!shouldEnableKoreaEnhancedCompliance) {
    if (isSignupCheckboxEnabled && !shouldDisableSignupCheckbox) {
      agreementsChecked = isTosChecked;
    } else if (shouldEnableStrictCompliance) {
      agreementsChecked = isTosChecked && isPrivacyPolicyChecked;
    }
  }

  return (
    birthdayStatus === FormFieldStatus.Valid &&
    usernameStatus === FormFieldStatus.Valid &&
    passwordStatus === FormFieldStatus.Valid &&
    agreementsChecked
  );
};
