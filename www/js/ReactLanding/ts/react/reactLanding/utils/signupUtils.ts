import { WithTranslationsProps } from 'react-utilities';
import { AccountSwitcherService, Endpoints } from 'Roblox';
import { httpService } from 'core-utilities';
import { dataStores } from 'core-roblox-utilities';
import {
  TValidateUsernameParams,
  TValidateUsernameResponse,
  TGetUserBirthdateResponse
} from '../../common/types/signupTypes';
import {
  usernameValidationMessageMap,
  localeParamName,
  urlQueryNames,
  counters,
  newUserParam,
  newUserSessionStorageKey,
  urlConstants,
  minSignUpAge,
  validationMessages,
  validateUsernameContext,
  accountSwitcherConfirmationModalContainer,
  signupCustomEvent
} from '../constants/signupConstants';
import { validateUsername } from '../services/signupService';
import { qualifiedSignup } from '../services/affiliateLinksService';
import getInvalidUsernameMessage from '../../common/utils/usernameValidationUtils';
import getInvalidPasswordMessage from '../../common/utils/passwordValidationUtils';
import { parseErrorCode } from '../../common/utils/requestUtils';
import { getUrlParamValue, navigateToPage } from '../../common/utils/browserUtils';
import { cleanupIdentityVerificationResultToken } from './identityVerificationUtils';
import {
  incrementEphemeralCounter,
  sendConversionEvent,
  sendLogoutAllAccountsOnSignupEvent
} from '../services/eventService';
import { landingPageContainer } from '../../common/constants/browserConstants';
import {
  confirmationModalOrigins,
  logoutAllAccountsPlaceholderStrings
} from '../../accountSwitcher/constants/accountSwitcherConstants';
import {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob
} from '../../accountSwitcher/utils/accountSwitcherUtils';
import { logoutAllLoggedInUsers } from '../../accountSwitcher/services/accountSwitcherService';
import { sendAuthClientErrorEvent } from '../../accountSwitcher/services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import {
  getExperienceAffiliateReferralUrl,
  getExperienceAffiliateShareLink,
  getLinkCode,
  getLinkType
} from './affiliateLinksUtils';
import { getSafeReturnUrlFromQueryString } from '../../reactLogin/utils/urlUtils';

const getErrorCodeFromValidateUsernameResponse = (response: TValidateUsernameResponse): string => {
  let validationMessage = '';
  if (usernameValidationMessageMap.has(response.code)) {
    validationMessage = usernameValidationMessageMap.get(response.code)!;
  }
  return validationMessage;
};

export type UsernameValidationResult = {
  message: string;
  didCheckAvailability: boolean;
};

export const getUsernameValidationResult = async (
  username?: string,
  birthdayDay?: string,
  birthdayMonth?: string,
  birthdayYear?: string
): Promise<UsernameValidationResult> => {
  let localValidationMessage = '';
  let hasLocalValidationFailure = false;

  if (username === undefined || username === '') {
    hasLocalValidationFailure = true;
    localValidationMessage = validationMessages.usernameRequired;
  } else {
    localValidationMessage = getInvalidUsernameMessage(username);
    if (localValidationMessage !== '') {
      hasLocalValidationFailure = true;
    }
  }

  if (!birthdayDay || !birthdayMonth || !birthdayYear) {
    hasLocalValidationFailure = true;
    localValidationMessage = validationMessages.birthdayRequired;
  }

  if (hasLocalValidationFailure) {
    return { message: localValidationMessage, didCheckAvailability: false };
  }

  const validateUsernameParams: TValidateUsernameParams = {
    username: username!,
    context: validateUsernameContext
  };

  const birthday = new Date(Date.parse(`${birthdayMonth!} ${birthdayDay!}, ${birthdayYear!}`));

  if (!Number.isNaN(birthday.getMilliseconds())) {
    validateUsernameParams.birthday = birthday;
  }

  try {
    const validateUsernameResponse = await validateUsername(validateUsernameParams);
    return {
      message: getErrorCodeFromValidateUsernameResponse(validateUsernameResponse),
      didCheckAvailability: true
    };
  } catch (error) {
    const errorCode = parseErrorCode(error);
    if (errorCode === 2) {
      return { message: validationMessages.birthdayRequired, didCheckAvailability: false };
    }
  }
  return { message: '', didCheckAvailability: false };
};

export const getUsernameValidationMessage = async (
  username?: string,
  birthdayDay?: string,
  birthdayMonth?: string,
  birthdayYear?: string,
  onAvailabilityChecked?: () => void
): Promise<string> => {
  const result = await getUsernameValidationResult(
    username,
    birthdayDay,
    birthdayMonth,
    birthdayYear
  );
  if (result.didCheckAvailability) {
    onAvailabilityChecked?.();
  }
  return result.message;
};

export const getPasswordValidationMessage = async (
  username?: string,
  password?: string,
  passwordThatFailedServerCheck?: string,
  country?: string,
  shouldRejectForbiddenPasswords = false
): Promise<string | null> => {
  let invalidPasswordMessage = '';
  if (password === undefined) {
    return null;
  }
  invalidPasswordMessage = await getInvalidPasswordMessage(
    password,
    username,
    country,
    shouldRejectForbiddenPasswords
  );
  if (invalidPasswordMessage !== '') {
    return invalidPasswordMessage;
  }
  if (password === passwordThatFailedServerCheck) {
    return validationMessages.useDifferentPassword;
  }
  return '';
};

export const getLocale = (): string | null => {
  if (Endpoints?.supportLocalizedUrls) {
    return Endpoints.getPageUrlLocale() || null;
  }

  return null;
};

export const buildLinkWithLocale = (url: string, locale: string): string => {
  if (locale) {
    return url + localeParamName + locale;
  }

  return url;
};

export const isValidBirthday = (year: string, month: string, day: string): boolean => {
  if (!year || !month || !day) {
    return false;
  }

  // Make sure we can create a valid date object
  const testDate = new Date(`${month} ${day} ${year}`);
  if (Number.isNaN(testDate.getTime())) {
    return false;
  }

  // checks that it is actually a valid day in that month (like feb 31 doesn't exist but would generate a valid Date)
  if (testDate.getDate() !== parseInt(day, 10)) {
    return false;
  }

  // age limits
  const today = new Date();
  const minimumBirthdate = new Date(
    today.getFullYear() - minSignUpAge,
    today.getMonth(),
    today.getDate()
  );
  const isBirthdayValid =
    testDate.getTime() <= minimumBirthdate.getTime() &&
    testDate.getFullYear() > today.getFullYear() - 100;
  if (!isBirthdayValid) {
    return false;
  }

  return true;
};

export const handlePostSignup = async (returnUrlValue?: string, userId?: string): Promise<void> => {
  cleanupIdentityVerificationResultToken();
  incrementEphemeralCounter(counters.success);
  window.dispatchEvent(new CustomEvent(signupCustomEvent, { detail: { userId } }));
  try {
    sessionStorage.setItem(newUserSessionStorageKey, 'true');
  } catch (e) {
    console.error('Error setting new user session flag:', e);
  }
  let returnUrl = returnUrlValue;
  try {
    if (userId) {
      const {
        authIntentDataStore: { applyUserAuthIntent, hasUnclaimedAuthIntent }
      } = dataStores;
      if (hasUnclaimedAuthIntent()) {
        incrementEphemeralCounter(counters.successWithGameIntent);
      }
      applyUserAuthIntent(userId);
    }
  } catch (e) {
    console.error('Error applying auth intent data:', e);
  }

  if (typeof returnUrl === 'string' && returnUrl.length > 0) {
    const affiliateLink = getExperienceAffiliateReferralUrl(returnUrl);
    if (affiliateLink) {
      const linkCode = getLinkCode(affiliateLink);
      const linkType = getLinkType(affiliateLink);
      await qualifiedSignup({
        referralUrl: affiliateLink ?? '',
        linkId: linkCode,
        linkType
      });
    }
    // NOTE(npatel, 2024-10-14): This will ensure that a qualified signup call will be made for
    // experience share link types.
    const shareLink = getExperienceAffiliateShareLink(returnUrl);
    if (shareLink) {
      const linkCode = getLinkCode(shareLink);
      const linkType = getLinkType(shareLink);
      await qualifiedSignup({
        referralUrl: shareLink ?? '',
        linkId: linkCode,
        linkType
      });
    }
    if (returnUrl.indexOf('?') === -1) {
      returnUrl += '?';
    } else {
      returnUrl += '&';
    }
    returnUrl += newUserParam;

    sendConversionEvent(() => navigateToPage(returnUrl!));
  } else {
    sendConversionEvent(() => navigateToPage(urlConstants.homePageNewUser));
  }
};

export const handleEmptyAccountSwitchBlobRequired = (
  confirmationCallback: () => void,
  translate: WithTranslationsProps['translate'],
  isParentError: boolean
): void => {
  const confirmationOrigin = isParentError
    ? confirmationModalOrigins.SignupVpcEmptyBlobRequiredError
    : confirmationModalOrigins.SignupEmptyBlobRequiredError;

  const untranslatedBodyText = isParentError
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpTextParent
    : logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpText;

  const authClientErrorContext = isParentError
    ? EVENT_CONSTANTS.context.accountSwitcherVpcSignup
    : EVENT_CONSTANTS.context.accountSwitcherSignup;

  const authClientErrorType = EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts;

  const ConfirmationModalParameters = {
    containerId: accountSwitcherConfirmationModalContainer,
    origin: confirmationOrigin,
    localizedTitleText: translate(logoutAllAccountsPlaceholderStrings.SignupConfirmationHeaderText),
    localizedBodyText: translate(untranslatedBodyText),
    localizedPrimaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.SignupConfirmationButtonText
    ),
    localizedSecondaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.SignupConfirmationCancelText
    ),
    primaryButtonCallback: async () => {
      sendLogoutAllAccountsOnSignupEvent();
      const blob = getStoredAccountSwitcherBlob();
      if (blob) {
        try {
          await logoutAllLoggedInUsers({
            encrypted_users_data_blob: blob
          });
        } catch (error) {
          sendAuthClientErrorEvent(authClientErrorContext, authClientErrorType);
        }
      }
      deleteAccountSwitcherBlob();
      confirmationCallback();
    },
    secondaryButtonCallback: () => {
      // no op for cancel button
    }
  };
  AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
};

export const getReturnUrl = (): string => {
  return getSafeReturnUrlFromQueryString();
};

export const getDataToken = (): string => {
  return decodeURIComponent(getUrlParamValue('dataToken') || '');
};

export const isVerifiedParentConsentSignup = (): boolean => {
  const dataToken = getDataToken();
  return !!dataToken;
};

export const getBirthdayToPrefill = (): string => {
  return decodeURIComponent(getUrlParamValue('birthday') || '');
};

export const getActiveUserBirthdayToPrefill = async (): Promise<string> => {
  const urlConfig = {
    withCredentials: true,
    url: urlConstants.getBirthdate
  };
  const birthdateResponse = await httpService.get<TGetUserBirthdateResponse>(urlConfig);
  const { data } = birthdateResponse;
  if (!data) {
    return '';
  }
  return `${data.birthMonth}/${data.birthDay}/${data.birthYear}`;
};

export const getActiveUserBirthdayToPrefillDate = async (): Promise<Date | null> => {
  const urlConfig = {
    withCredentials: true,
    url: urlConstants.getBirthdate
  };
  const birthdateResponse = await httpService.get<TGetUserBirthdateResponse>(urlConfig);
  const { data } = birthdateResponse;
  if (!data) {
    return null;
  }
  return new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
};

export const getIsSignupButtonDisabled = (isFormValid: boolean, isSubmitting: boolean): boolean => {
  return !isFormValid || isSubmitting;
};

export default {
  getLocale,
  buildLinkWithLocale,
  isValidBirthday,
  handlePostSignup,
  getUsernameValidationMessage,
  getPasswordValidationMessage,
  getReturnUrl,
  getBirthdayToPrefill,
  getActiveUserBirthdayToPrefill
};

export const getIsKoreaSignupPoliciesAgreementButtonDisabled = (
  isPoliciesAgreementCheckBoxesChecked: boolean,
  isSubmitting: boolean
): boolean => {
  return !isPoliciesAgreementCheckBoxesChecked || isSubmitting;
};
