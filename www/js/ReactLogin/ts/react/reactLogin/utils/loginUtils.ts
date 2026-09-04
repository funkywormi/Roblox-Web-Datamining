import { AccountSwitcherService, CaptchaConstants } from 'Roblox';
import { fido2Util } from 'core-roblox-utilities';
import { urlService } from 'core-utilities';
import { TranslateFunction } from 'react-utilities';
import {
  confirmationModalOrigins,
  logoutAllAccountsPlaceholderStrings
} from '../../accountSwitcher/constants/accountSwitcherConstants';
import { logoutAllLoggedInUsers } from '../../accountSwitcher/services/accountSwitcherService';
import { sendAuthClientErrorEvent } from '../../accountSwitcher/services/eventService';
import {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob
} from '../../accountSwitcher/utils/accountSwitcherUtils';
import {
  reactLoginPageContainer,
  reactWebAppLoginPageContainer
} from '../../common/constants/browserConstants';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import { urlQueryConstants } from '../../common/constants/urlConstants';
import RobloxEventTracker from '../../common/eventTracker';
import { CredentialType } from '../../common/types/loginTypes';
import { navigateToPage } from '../../common/utils/browserUtils';
import { isPhoneNumber, isValidEmail } from '../../common/utils/formUtils';
import {
  accountSwitchingSignupUrl,
  containerConstants,
  counterConstants,
  errorCodes,
  eventCounters,
  isNewLoginQueryString,
  urlConstants
} from '../constants/loginConstants';
import { sendLogoutAllAccountsOnLoginEvent } from '../services/eventService';
import { env, getEnvironment, getSafeReturnUrlFromQueryString } from './urlUtils';

const { composeQueryString } = urlService;

export const shouldOpenSwitchAccountFromQueryString = (): boolean => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('openSwitchAccount')?.toLowerCase() === 'true';
};

// Mapping from captchaErrorCode to loginErrorCode
export const getLoginErrorCodeFromCaptchaErrorCode = (captchaErrorCode: number): number => {
  const { failedToLoadProviderScript, failedToVerify } = CaptchaConstants.errorCodes;
  const { captchaLoadFailed, captchaVerifyFailed, captchaUnknownError } = errorCodes;
  switch (captchaErrorCode) {
    case failedToLoadProviderScript:
      return captchaLoadFailed;
    case failedToVerify:
      return captchaVerifyFailed;
    default:
      return captchaUnknownError;
  }
};

// Navigate to forgot credentials page when login endpoint returns passwordResetRequired
export const navigateToForgotCredentialsPage = (credentialValue: string): void => {
  if (credentialValue === '') {
    navigateToPage(urlConstants.forgotCredentialsUrl);
  } else {
    navigateToPage(
      `${urlConstants.forgotCredentialsUrl}?identifier=${encodeURIComponent(credentialValue)}`
    );
  }
};

// EphemeralCounter
export const incrementEphemeralCounter = (eventName: string): void => {
  if (RobloxEventTracker && eventName) {
    RobloxEventTracker.fireEvent(counterConstants.prefix + eventName);
  }
};

export const signPasskeyCredential = (
  options: string,
  mediation = 'conditional',
  abortSignal?: AbortSignal
): Promise<Credential | null> => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const makeAssertionOptions = fido2Util.convertPublicKeyParametersToStandardBase64(options);
  return navigator.credentials.get({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeAssertionOptions)),
    mediation: mediation as CredentialMediationRequirement,
    signal: abortSignal
  });
};

export const mapErrorCodeToEphemeralEvent = (errorCode: number | null) => {
  let eventName = eventCounters.unknownError;
  switch (errorCode) {
    case errorCodes.badCredentials:
      eventName = eventCounters.invalidCredentials;
      break;
    case errorCodes.accountNotFound:
      eventName = eventCounters.accountNotFound;
      break;
    case errorCodes.accountIssue:
      eventName = eventCounters.accountIssue;
      break;
    case errorCodes.tooManyAttempts:
      eventName = eventCounters.tooManyAttempts;
      break;
    case errorCodes.defaultLoginRequired:
      eventName = eventCounters.defaultLoginRequired;
      break;
    case errorCodes.unverifiedCredentials:
      eventName = eventCounters.unverifiedAccount;
      break;
    case errorCodes.captchaLoadFailed:
      eventName = eventCounters.captchaLoadFailed;
      break;
    case errorCodes.captchaVerifyFailed:
      eventName = eventCounters.captchaVerifyFailed;
      break;
    case errorCodes.luoBuUserDenied:
      eventName = eventCounters.luoBuUserDenied;
      break;
    case errorCodes.captchaUnknownError:
      eventName = eventCounters.captchaUnknownError;
      break;
    case errorCodes.screentimeRestricted:
      eventName = eventCounters.screentimeRestricted;
      break;
    default:
      eventName = eventCounters.unknownError;
      break;
  }
  return eventName;
};

const getCredentialErrorMessage = (errorCode: number, ctype?: CredentialType): string => {
  switch (errorCode) {
    case errorCodes.badCredentials:
      if (ctype === CredentialType.Email) {
        return FeatureLoginPage.ResponseIncorrectEmailOrPassword;
      }
      if (ctype === CredentialType.PhoneNumber) {
        return FeatureLoginPage.ResponseIncorrectPhoneOrPassword;
      }
      if (ctype === CredentialType.EmailOtpSessionToken) {
        return FeatureLoginPage.ResponseIncorrectCredentials;
      }
      if (ctype === CredentialType.Passkey) {
        return FeatureLoginPage.ResponseInvalidPasskeyCredential;
      }
      if (ctype === CredentialType.MagicLink) {
        return FeatureLoginPage.MessageUnknownErrorTryAgain;
      }
      return FeatureLoginPage.ResponseIncorrectUsernamePassword;

    case errorCodes.defaultLoginRequired:
      if (ctype === CredentialType.Email) {
        return FeatureLoginPage.ResponseEmailLinkedToMultipleAccountsLoginWithUsername;
      }
      if (ctype === CredentialType.PhoneNumber) {
        return FeatureLoginPage.ResponseLoginWithUsername;
      }
      return '';

    case errorCodes.unverifiedCredentials:
      if (ctype === CredentialType.Email) {
        return FeatureLoginPage.ResponseUnverifiedEmailLoginWithUsername;
      }
      if (ctype === CredentialType.PhoneNumber) {
        return FeatureLoginPage.ResponseUnverifiedPhoneLoginWithUsername;
      }
      return '';

    default:
      return '';
  }
};

export const mapLoginErrorCodeToTranslationKey = (
  errorCode: number | null,
  ctype?: CredentialType
): string => {
  switch (errorCode) {
    case errorCodes.defaultLoginRequired:
    case errorCodes.unverifiedCredentials:
    case errorCodes.badCredentials:
      return getCredentialErrorMessage(errorCode, ctype);
    case errorCodes.accountNotFound:
      return FeatureLoginPage.ResponseAccountNotFound;
    case errorCodes.accountIssue:
      return FeatureLoginPage.ResponseAccountIssueErrorContactSupport;
    case errorCodes.tooManyAttempts:
      return FeatureLoginPage.ResponseTooManyAttemptsPleaseWait;
    case errorCodes.captchaLoadFailed:
      return FeatureLoginPage.ResponseCaptchaErrorFailedToLoad;
    case errorCodes.captchaVerifyFailed:
      return FeatureLoginPage.ResponseCaptchaErrorFailedToVerify;
    case errorCodes.luoBuUserDenied:
      return FeatureLoginPage.ResponseGlobalAppAccessError;
    case errorCodes.captchaUnknownError:
      return FeatureLoginPage.MessageUnknownErrorTryAgain;
    case errorCodes.screentimeRestricted:
      return FeatureLoginPage.DescriptionCurfewMessage;
    case errorCodes.credentialsNotAllowed:
      return FeatureLoginPage.ResponseOtpUnder13NotAllowed;
    case errorCodes.loginBlocked:
      return FeatureLoginPage.ResponseLoginBlocked;
    case errorCodes.passkeyOnlyAccount:
      return FeatureLoginPage.ErrorPasskeyOnlyAccount;
    default:
      return FeatureLoginPage.MessageUnknownErrorTryAgain;
  }
};

export const getCredentialType = (
  credentialValue: string
): CredentialType.Email | CredentialType.PhoneNumber | CredentialType.Username => {
  if (isValidEmail(credentialValue)) {
    return CredentialType.Email;
  }
  if (isPhoneNumber(credentialValue)) {
    return CredentialType.PhoneNumber;
  }
  return CredentialType.Username;
};

export const getReturnUrl = (): string => {
  const entryPoint = reactLoginPageContainer();
  const webAppEntryPoint = reactWebAppLoginPageContainer();
  const useFrontendReturnUrl =
    entryPoint?.getAttribute('data-enable-frontend-return-url')?.toLowerCase() === 'true';
  const returnUrl =
    useFrontendReturnUrl || webAppEntryPoint
      ? getSafeReturnUrlFromQueryString()
      : entryPoint?.getAttribute('data-return-url') || '';
  const returnUrlWithHash = `${returnUrl}${window.location.hash ?? ''}`;
  return returnUrlWithHash;
};

const addNewLoginQueryStringToUrl = (url: string) => {
  if (!url) {
    return '/';
  }

  let result = url;
  if (url.indexOf(urlQueryConstants.urlQueryStringPrefix) > -1) {
    result += urlQueryConstants.urlQueryParameterSeparator;
  } else {
    result += urlQueryConstants.urlQueryStringPrefix;
  }

  result += isNewLoginQueryString;
  return result;
};

export const getRedirectUrl = () => {
  const url = addNewLoginQueryStringToUrl(getReturnUrl());
  return urlService.getAbsoluteUrl(url);
};

// On sitetests, the authorize host is environment-scoped
// (e.g. authorize.sitetest1.robloxlabs.com) rather than authorize.roblox.com.
const getAuthorizeRobloxOAuthHost = (): string => {
  const environment = getEnvironment();
  switch (environment) {
    case env.Sitetest3:
    case env.Sitetest2:
    case env.Sitetest1:
      return `authorize.${environment}.robloxlabs.com`;
    case env.Production:
    default:
      return 'authorize.roblox.com';
  }
};

export const isAuthorizeRobloxOAuthReturnUrl = (url: string): boolean => {
  if (!url.trim()) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === getAuthorizeRobloxOAuthHost();
  } catch {
    return false;
  }
};

export const buildAccountSelectorHelpText = (
  credentialType: CredentialType,
  translate: TranslateFunction
): string => {
  if (credentialType === CredentialType.EmailOtpSessionToken) {
    return `${translate(FeatureLoginPage.DescriptionAccountSelectorHelp)} ${translate(
      FeatureLoginPage.DescriptionAccountSelectorOtpTimeWarning,
      {
        timeLimitSec: '60'
      }
    )}`;
  }
  return translate(FeatureLoginPage.DescriptionAccountSelectorHelp);
};

export const getAccountSwitchingSignupUrl = (): string => {
  const returnUrl = getRedirectUrl();
  return `${accountSwitchingSignupUrl}?${composeQueryString({ returnUrl })}`;
};

export const buildLoginFormHeaderText = (
  isAuthenticated: boolean,
  translate: TranslateFunction,
  hasUsersAvailableForSwitching: boolean
): string => {
  if (
    hasUsersAvailableForSwitching /* add account from logged-out switcher */ ||
    isAuthenticated /* add account while already logged in */
  ) {
    return translate(FeatureLoginPage.HeadingAddAccount);
  }
  return translate(FeatureLoginPage.HeadingLoginRoblox);
};

export const handleEmptyAccountSwitchBlobRequiredForLogin = (
  translate: TranslateFunction,
  handleSubmit: (isFromLoginButtonClick: boolean) => void,
  handleAbandon: () => void,
  isParentError: boolean
) => {
  const confirmationOrigin = isParentError
    ? confirmationModalOrigins.LoginVpcEmptyBlobRequiredError
    : confirmationModalOrigins.LoginEmptyBlobRequiredError;

  const untranslatedBodyText = isParentError
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpTextParent
    : logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpText;

  const authClientErrorContext = isParentError
    ? EVENT_CONSTANTS.context.accountSwitcherVpcLogin
    : EVENT_CONSTANTS.context.accountSwitcherLogin;

  const authClientErrorType = EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts;
  const ConfirmationModalParameters = {
    containerId: containerConstants.accountSwitcherConfirmationModalContainer,
    origin: confirmationOrigin,
    localizedTitleText: translate(logoutAllAccountsPlaceholderStrings.LoginConfirmationHeaderText),
    localizedBodyText: translate(untranslatedBodyText),
    localizedPrimaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.LoginConfirmationButtonText
    ),
    localizedSecondaryButtonText: translate(
      logoutAllAccountsPlaceholderStrings.LoginConfirmationCancelText
    ),
    primaryButtonCallback: async () => {
      sendLogoutAllAccountsOnLoginEvent();
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
      handleSubmit(false);
    },
    secondaryButtonCallback: () => {
      handleAbandon();
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
};
