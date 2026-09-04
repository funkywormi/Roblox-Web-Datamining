import { errorCodes, validationMessages } from '../constants/signupConstants';
import { parseErrorCode } from '../../common/utils/requestUtils';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

export type SignupFieldError = 'birthday' | 'username' | 'password';

export type SignupErrorOutcome =
  | { type: 'captcha' }
  | {
      type: 'field';
      field: SignupFieldError;
      message: string;
      shouldRememberRejectedPassword: boolean;
    }
  | { type: 'identityVerification' }
  | { type: 'general'; message: string }
  | { type: 'ageRestriction' }
  | {
      type: 'accountSwitcher';
      reason: 'emptyBlob' | 'maxAccounts' | 'parentEmptyBlob';
    }
  | { type: 'passkeyRegistrationFailed' }
  | { type: 'abandonedChallenge' }
  | { type: 'unknown'; isTooManyAttempts: boolean };

/**
 * Classifies a production `/v2/signup` rejection without applying React state
 * or navigation effects. The production form remains responsible for those
 * effects; a new signup surface can reuse the same classification contract.
 */
export const classifySignupError = (
  error: unknown,
  isChallengeAbandoned: () => boolean
): SignupErrorOutcome => {
  const errorCode = error === null || error === undefined ? null : parseErrorCode(error);
  switch (errorCode) {
    case errorCodes.captcha:
      return { type: 'captcha' };
    case errorCodes.invalidBirthdate:
      return {
        type: 'field',
        field: 'birthday',
        message: validationMessages.birthdayInvalid,
        shouldRememberRejectedPassword: false
      };
    case errorCodes.invalidUsername:
      return {
        type: 'field',
        field: 'username',
        message: validationMessages.usernameInvalid,
        shouldRememberRejectedPassword: false
      };
    case errorCodes.usernameTaken:
      return {
        type: 'field',
        field: 'username',
        message: validationMessages.usernameAlreadyInUse,
        shouldRememberRejectedPassword: false
      };
    case errorCodes.invalidPassword:
      return {
        type: 'field',
        field: 'password',
        message: validationMessages.useDifferentPassword,
        shouldRememberRejectedPassword: true
      };
    case errorCodes.passwordSameAsUsername:
    case errorCodes.passwordTooSimple:
      return {
        type: 'field',
        field: 'password',
        message: validationMessages.passwordInvalid,
        shouldRememberRejectedPassword: true
      };
    case errorCodes.invalidIdentityVerificationResultToken:
    case errorCodes.identityVerificationFailed:
      return { type: 'identityVerification' };
    case errorCodes.insertAcceptancesFailed:
      return {
        type: 'general',
        message: validationMessages.accountCreatedButLoginFailed
      };
    case errorCodes.ageUnder13:
    case errorCodes.ageUnder18:
      return { type: 'ageRestriction' };
    case errorCodes.emptyAccountSwitchBlobRequired:
      return { type: 'accountSwitcher', reason: 'emptyBlob' };
    case errorCodes.maxLoggedInAccountsLimitReached:
      return { type: 'accountSwitcher', reason: 'maxAccounts' };
    case errorCodes.parentEmptyAccountSwitchBlobRequired:
      return { type: 'accountSwitcher', reason: 'parentEmptyBlob' };
    case errorCodes.passkeyRegistrationFailed:
      return { type: 'passkeyRegistrationFailed' };
    default:
      if (isChallengeAbandoned()) {
        return { type: 'abandonedChallenge' };
      }
      return {
        type: 'unknown',
        isTooManyAttempts:
          typeof error === 'object' &&
          error !== null &&
          (error as Record<string, unknown>).status === errorCodes.tooManyAttepmts
      };
  }
};

/**
 * Keyed off the classifier's own outcome type so the reported taxonomy cannot
 * drift from the branch that rendered the message.
 */
export const getSignupErrorState = (outcome: SignupErrorOutcome): string => {
  const { signupError } = EVENT_CONSTANTS.state;
  if (outcome.type === 'unknown') {
    return outcome.isTooManyAttempts ? signupError.unknownTooManyAttempts : signupError.unknown;
  }
  return signupError[outcome.type];
};

/** Only field-level rejections name a field; everything else is form-level. */
export const getSignupErrorField = (outcome: SignupErrorOutcome): string => {
  const { field } = EVENT_CONSTANTS;
  if (outcome.type !== 'field') {
    return field.general;
  }
  switch (outcome.field) {
    case 'birthday':
      return field.birthday;
    case 'username':
      return field.signupUsername;
    default:
      return field.signupPassword;
  }
};
