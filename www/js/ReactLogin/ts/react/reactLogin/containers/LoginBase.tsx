/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading, createModal } from 'react-style-guide';
import { authenticatedUser } from 'header-scripts';
import {
  AccountIntegrityChallengeService,
  AccountSwitcherService,
  EmailVerifyCodeModalService
} from 'Roblox';
import { fido2Util, dataStores, cryptoUtil, TSecureAuthIntent } from 'core-roblox-utilities';
import { confirmationModalOrigins } from '../../accountSwitcher/constants/accountSwitcherConstants';
// constants
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import {
  errorCodes,
  retryAttempts,
  eventCounters,
  containerConstants,
  otpOrigin,
  experimentLayer,
  loginCustomEvent
} from '../constants/loginConstants';
import {
  attemptSetPasskeyUpgradeFlag,
  SilentPasskeyUpgradeVariant
} from '../utils/loginPasskeyUpgrade';
import { loginTranslationConfig } from '../translation.config';
import {
  TCaptchaInputParams,
  TOnCaptchaChallengeCompletedData,
  TOnCaptchaChallengeInvalidatedData
} from '../../common/types/captchaTypes';
import {
  T2svChallengeInputParams,
  TOn2svChallengeCompletedData,
  TOn2svChallengeInvalidatedData
} from '../../common/types/twoStepVerificationTypes';
import {
  TSecurityQuestionsInputParam,
  TOnSecurityQuestionsChallengeCompletedData,
  TOnSecurityQuestionsChallengeInvalidatedData
} from '../../common/types/securityQuestionsTypes';
import { TMultipleUsersPerCredentialErrorData } from '../../common/types/accountSelectorTypes';
import {
  TLoginParams,
  CredentialType,
  TLoginResponse,
  TLoginWithVerificationTokenResponse
} from '../../common/types/loginTypes';

import { TLoginWithAuthTokenParams } from '../../common/types/crossDeviceLoginTypes';
import { TEnterCodeErrorEvent } from '../../common/types/otpTypes';
// services
import { getOtpMetadata } from '../../common/services/otpService';
import { getPasskeyChallenge, isPasskeyLoginEnabled } from '../../common/services/passkeyService';
import { login, loginWithVerificationToken } from '../services/loginService';
import {
  sendAccountSelectionEvent,
  sendAccountSelectorLoadEvent,
  sendAvailableAccountsForSwitchingOnPageLoadEvent,
  sendAuthPageLoadEvent,
  sendLoginButtonClickEvent,
  sendOtpLoginButtonClickEvent,
  sendOtpLoginErrorEvent,
  sendPasskeyLoginPageLoadEvent,
  sendPlatformAuthenticatorSupportPageLoadEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

// utils
import { detectInputMethod, InputMethod } from '../../common/utils/inputMethodUtils';
import { defaultRedirect, navigateToLogin, navigateToPage } from '../../common/utils/browserUtils';
import {
  incrementEphemeralCounter,
  mapLoginErrorCodeToTranslationKey,
  getLoginErrorCodeFromCaptchaErrorCode,
  getRedirectUrl,
  isAuthorizeRobloxOAuthReturnUrl,
  getCredentialType,
  mapErrorCodeToEphemeralEvent,
  buildAccountSelectorHelpText,
  buildLoginFormHeaderText,
  signPasskeyCredential,
  handleEmptyAccountSwitchBlobRequiredForLogin,
  shouldOpenSwitchAccountFromQueryString
} from '../utils/loginUtils';
import { parseErrorCode } from '../../common/utils/requestUtils';
import {
  parseCaptchaData,
  parseSecurityQuestionsData,
  parseUsersData
} from '../../common/utils/errorParsingUtils';

// components
import LoginForm from '../components/LoginForm';
import CaptchaComponent from '../../common/components/CaptchaComponent';
import Login2sv from '../components/Login2sv';
import LoginAlternative from '../components/LoginAlternative';
import LoginIdVerification from '../components/LoginIdVerification';
import LoginSecurityQuestions from '../components/LoginSecurityQuestions';
import SignupLink from '../components/SignupLink';
import ForgotCredentialLink from '../components/ForgotCredentialLink';
import AccountSelectorComponent from '../../common/components/AccountSelectorComponent';
import { EmailVerifyCodeModalParams } from '../../emailVerifyCodeModal/interface';
import useExperiments from '../../common/hooks/useExperiments';
import LoginAccountSwitcher from '../components/LoginAccountSwitcher';
import AccountSwitcherRestrictionComponent from '../../common/components/AccountSwitcherRestrictionComponent';
import { accountSwitcherConfirmationModalContainer } from '../../reactLanding/constants/signupConstants';
import useLoggedInUsers from '../../common/hooks/useLoggedInUsers';
import useRedirectHomeIf from '../../common/hooks/useRedirectHomeIf';
import useCheckParentUrl from '../../common/hooks/useCheckParentUrl';
import {
  getExperienceAffiliateReferralUrl,
  getLinkCode,
  getLinkType
} from '../../reactLanding/utils/affiliateLinksUtils';
import { qualifiedLogin } from '../../reactLanding/services/affiliateLinksService';
import SecurityNotificationModal from '../components/SecurityNotificationModal';
import useLoginBackground from '../../common/hooks/useLoginBackground';
import CountryRatingLogos from '../../reactLanding/components/CountryRatingLogos';
import {
  urlConstants as landingUrlConstants,
  landingPageStrings
} from '../../reactLanding/constants/landingConstants';
import useContentRatingLogos from '../../common/hooks/useContentRatingLogos';
import {
  getMagicLinkTokenFromQueryString,
  magicLinkTokenQueryParam
} from '../revamp/magicLinkLoginUtils';
import MagicLinkLoginErrorModal from '../revamp/MagicLinkLoginErrorModal';

export const LoginBase = ({ translate }: WithTranslationsProps): JSX.Element => {
  // page state
  const [isNavigating, setIsNavigating] = useState(false);

  // captcha states
  const [unifiedCaptchaId, setUnifiedCaptchaId] = useState('');
  const [dataExchange, setDataExchange] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  // 2sv states
  const [userId, setUserId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [failed2svChallengeCount, setFailed2svChallengeCount] = useState(0);

  // security questions state
  const [securityQuestionsSessionId, setSecurityQuestionsSessionId] = useState('');
  const [securityQuestionsRedemptionToken, setSecurityQuestionsRedemptionToken] = useState('');

  // account selector states
  const [multipleUsersPerCredentialData, setMultipleUsersPerCredentialData] = useState({
    users: [],
    invalidUsers: []
  } as TMultipleUsersPerCredentialErrorData);
  const [selectedUserId, setSelectedUserId] = useState(0);

  // form states
  const [credentialValue, setCredentialValue] = useState('');
  const [credentialType, setCredentialType] = useState(CredentialType.Username);
  const [password, setPassword] = useState('');
  const passwordAutofillRef = useRef(false);
  // The single-use magic-link token is held in a mutable ref so it can be
  // cleared once the redemption fails terminally (see handleLoginError).
  // `isMagicLinkLogin` captures the initial presence of the token for
  // render-time gating and stays stable for the lifetime of the page even
  // after the token is consumed.
  const magicLinkTokenRef = useRef(getMagicLinkTokenFromQueryString());
  const isMagicLinkLogin = useRef(Boolean(magicLinkTokenRef.current)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useDefaultCredentialType, setUseDefaultCredentialType] = useState(false);

  // alternative login states
  const [authTokenCode, setAuthTokenCode] = useState('');
  const [authTokenPrivateKey, setAuthTokenPrivateKey] = useState('');
  const [otpLoginSessionToken, setOtpLoginSessionToken] = useState('');
  const [otpLoginCode, setOtpLoginCode] = useState('');
  const [isOtpLoginEnabled, setIsOtpLoginEnabled] = useState(false);

  // passkeyStates
  const [passkeyLoginSessionToken, setPasskeyLoginSessionToken] = useState('');
  const [passkeyLoginCode, setPasskeyLoginCode] = useState('');
  const [passkeyAttempt, setPasskeyAttempt] = useState(0);
  const [isPasskeyLoginSupported, setIsPasskeyLoginSupported] = useState(false);
  const [isConditionalMediationSupported, setIsConditionalMediationSupported] = useState(false);
  const [isConditionalCreateSupported, setIsConditionalCreateSupported] = useState(false);
  const passkeyAbortControllerRef = useRef(new AbortController());

  const [showSecurityNotificationModal, setShowSecurityNotificationModal] = useState(false);
  const [isMagicLinkLoginErrorModalOpen, setIsMagicLinkLoginErrorModalOpen] = useState(false);

  // Brazil content rating logo
  const { shouldDisplayBrazilRatingLogo } = useContentRatingLogos();

  // default state cannot be 0, as submit is triggered once code reaches code length
  const [otpLoginCodeLength, setOtpCodeLength] = useState(100);

  let isFirstAttempt = true;
  // id verification states
  const [identityVerificationLoginTicket, setIdentityVerificationLoginTicket] = useState('');

  const loginExperiments = useExperiments(experimentLayer);
  const isOneTimeCodeDesignUpdated = loginExperiments.IsLoginUiUpdatesEnabled as boolean;
  const loginSilentUpgradeBrowserCheck = loginExperiments.loginSilentUpgradeBrowserCheck as SilentPasskeyUpgradeVariant;

  // background image states
  const { isLoginBackgroundImageEnabled, loginBackgroundClass } = useLoginBackground();

  // account switching
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(true);
  const [hasMaxLoggedInAccountsLoginError, setHasMaxLoggedInAccountsLoginError] = useState(false);
  const { loggedInUsers, isGettingLoggedInUsers } = useLoggedInUsers(
    !(authenticatedUser?.isAuthenticated ?? false) // shouldFetchUserInfo only if not authenticated
  );
  const [
    isAccountSwitchingEnabledForBrowser,
    isAccountSwitcherHookCompleted
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false, false];

  const isParentUserUrl = useCheckParentUrl();

  const shouldTriggerIdVerification = (
    result: TLoginResponse | TLoginWithVerificationTokenResponse
  ) => {
    return Boolean(result?.identityVerificationLoginTicket);
  };

  const triggerIdVerification = (result: TLoginResponse | TLoginWithVerificationTokenResponse) => {
    setIdentityVerificationLoginTicket(result.identityVerificationLoginTicket);
  };

  const removeMagicLinkTokenFromUrl = (): void => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(magicLinkTokenQueryParam);
    const remainingSearch = searchParams.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ''}${
        window.location.hash
      }`
    );
  };

  const navigateWithReturnUrl = (): void => {
    const returnUrl = getRedirectUrl();
    const affiliateLink = getExperienceAffiliateReferralUrl(returnUrl);
    if (affiliateLink) {
      const linkCode = getLinkCode(affiliateLink);
      const linkType = getLinkType(affiliateLink);
      qualifiedLogin({
        referralUrl: affiliateLink ?? '',
        linkId: linkCode,
        linkType,
        userDidLogIn: true
      });
    }
    navigateToPage(returnUrl);
  };

  const navigatePostLogin = (postLoginUserId: string) => {
    setIsLoading(true);
    navigateWithReturnUrl();
  };

  const navigatePostAccountSwitch = () => {
    setIsNavigating(true);
    const redirectUrl = getRedirectUrl();
    if (isAuthorizeRobloxOAuthReturnUrl(redirectUrl)) {
      navigateWithReturnUrl();
    } else {
      defaultRedirect();
    }
  };

  const shouldTrigger2sv = (result: TLoginResponse): boolean => {
    return Boolean(result?.twoStepVerificationData?.ticket);
  };

  const trigger2sv = (result: TLoginResponse) => {
    const input2svParams = {
      userId: result.user.id.toString(),
      challengeId: result.twoStepVerificationData.ticket
    };
    setIsLoading(false);
    handle2svDataUpdated(input2svParams);
    passkeyAbortControllerRef.current.abort();
  };

  /*
    The 2sv handler upon triggering the challenge.
  */
  const handle2svDataUpdated = (data: T2svChallengeInputParams): void => {
    setUserId(data.userId);
    setChallengeId(data.challengeId);
  };

  /*
    The 2sv handler when the challenge is completed.
  */
  const handle2svChallengeCompleted = async (data: TOn2svChallengeCompletedData) => {
    try {
      const params = {
        challengeId,
        verificationToken: data.verificationToken,
        rememberDevice: data.rememberDevice,
        accountBlob: AccountSwitcherService?.getStoredAccountSwitcherBlob()
      };

      const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
      const authParams = { ...params, secureAuthenticationIntent };
      const result: TLoginWithVerificationTokenResponse = await loginWithVerificationToken(
        userId,
        authParams
      );
      if (authParams.secureAuthenticationIntent) {
        incrementEphemeralCounter(eventCounters.successWithSAI);
      }
      if (shouldTriggerIdVerification(result)) {
        triggerIdVerification(result);
      } else {
        AccountSwitcherService?.storeAccountSwitcherBlob(
          result.accountBlob ? result.accountBlob : ''
        );
        window.dispatchEvent(new CustomEvent(loginCustomEvent, { detail: { userId } }));

        attemptSetPasskeyUpgradeFlag({
          credentialType,
          isPasskeyLoginSupported,
          isConditionalCreateSupported,
          isPasswordAutofilled: passwordAutofillRef.current,
          loginSilentUpgradeBrowserCheck,
          userId
        });

        // eslint-disable-next-line no-void
        void navigatePostLogin(userId);
      }
    } catch (error) {
      // pass down error to form
      // Note that this is not the same error when a user puts the wrong 2sv code.
      handleUnknownError();
    }
  };

  /*
    The 2sv handler when system errors are returned from the service
  */
  const handle2svChallengeInvalidated = (data: TOn2svChallengeInvalidatedData) => {
    setFailed2svChallengeCount(failed2svChallengeCount + 1);
    const errorMessage = translate(FeatureLoginPage.ResponseVerificationError);
    setErrorMsg(errorMessage);
    if (failed2svChallengeCount < retryAttempts.maxInvalidated2svChallengeAttempts) {
      handleSubmit(false);
    } else {
      clearPostSubmitState(errorMessage);
    }
  };

  /*
    The 2sv handler when the challenge is abandoned
  */
  const handle2svChallengeAbandoned = (data: unknown) => {
    refetchPasskeyChallenge();
    setUserId('');
    setChallengeId('');
    clearPostSubmitState();
  };

  /*
    The captcha handler upon triggering the challenge
  */
  const handleCaptchaDataUpdated = (data: TCaptchaInputParams) => {
    setUnifiedCaptchaId(data.unifiedCaptchaId);
    setDataExchange(data.dataExchange);
  };

  /*
    The captcha handler when the challenge is completed
  */
  const handleCaptchaChallengeCompleted = (data: TOnCaptchaChallengeCompletedData) => {
    setCaptchaId(data.captchaId);
    setCaptchaToken(data.captchaToken);
  };

  /*
    The captcha handler when system errors are returned from the service
  */
  const handleCaptchaChallengeInvalidated = (data: TOnCaptchaChallengeInvalidatedData) => {
    const errorCode = getLoginErrorCodeFromCaptchaErrorCode(data.errorCode);
    const cType = getCredentialType(credentialValue);
    const errorMessage = translate(mapLoginErrorCodeToTranslationKey(errorCode, cType));
    setErrorMsg(errorMessage);
    clearPostSubmitState(errorMessage);
  };

  const handleCaptchaChallengeAbandoned = () => {
    clearPostSubmitState();
  };

  /*
    The security questions handler upon triggering the challenge
  */
  const handleSecurityQuestionsDataUpdated = (data: TSecurityQuestionsInputParam) => {
    setUserId(data.userId);
    setSecurityQuestionsSessionId(data.sessionId);
  };

  /*
    The security questions handler when the challenge is completed
  */
  const handleSecurityQuestionsChallengeCompleted = (
    data: TOnSecurityQuestionsChallengeCompletedData
  ) => {
    setSecurityQuestionsRedemptionToken(data.redemptionToken);
  };

  /*
    The security questions handler when system errors are returned from the service
  */
  const handleSecurityQuestionsChallengeInvalidated = (
    data: TOnSecurityQuestionsChallengeInvalidatedData
  ) => {
    setSecurityQuestionsSessionId('');
    setSecurityQuestionsRedemptionToken('');
    handleSubmit(false);
  };
  const handleSecurityQuestionsChallengeAbandoned = (data: unknown) => {
    setUserId('');
    setSecurityQuestionsSessionId('');
    clearPostSubmitState();
  };

  /*
    The login form handlers
  */
  const handleCredentialValueChange = (value: string) => {
    setErrorMsg('');
    setCredentialValue(value);
    setCredentialType(getCredentialType(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setPassword(e.target.value);
    const method = detectInputMethod(e.nativeEvent);
    passwordAutofillRef.current = method === InputMethod.Autofilled;
  };

  const handlePostLogin = (result: TLoginResponse) => {
    // TODO: get blob for 2sv account
    if (shouldTrigger2sv(result)) {
      trigger2sv(result);
    } else if (shouldTriggerIdVerification(result)) {
      // About the order of these checks, since identityVerificationLoginTicket
      // returns from 2sv endpoint as well, it should be checked after 2sv.
      triggerIdVerification(result);
    } else {
      try {
        AccountSwitcherService?.storeAccountSwitcherBlob(
          result.accountBlob ? result.accountBlob : ''
        );
      } catch (e) {
        // TODO: do we want to show user the error?
        console.warn('Failed to save blob.', e);
      }
      // update auth intent store once we have a user
      try {
        if (result.user.id) {
          const {
            authIntentDataStore: { applyUserAuthIntent }
          } = dataStores;
          applyUserAuthIntent(result.user.id.toString());
        }
      } catch (e) {
        console.error('Error applying auth intent data:', e);
      }

      const postLoginUserId = result.user.id.toString();
      window.dispatchEvent(
        new CustomEvent(loginCustomEvent, { detail: { userId: postLoginUserId } })
      );

      attemptSetPasskeyUpgradeFlag({
        credentialType,
        isPasskeyLoginSupported,
        isConditionalCreateSupported,
        isPasswordAutofilled: passwordAutofillRef.current,
        loginSilentUpgradeBrowserCheck,
        userId: postLoginUserId
      });

      // eslint-disable-next-line no-void
      void navigatePostLogin(postLoginUserId);
    }
  };

  const clearCaptchaData = () => {
    setDataExchange('');
    setUnifiedCaptchaId('');
  };

  const handleLoginError = (error: unknown, cType: CredentialType) => {
    // Ignore generic challenge abandons.
    if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
      refetchPasskeyChallenge();
      setIsLoading(false);
      handleOtpLoginError('');
      setSelectedUserId(0);
      return;
    }
    const errorCode = parseErrorCode(error);

    let errorMessage;
    // A magic-link failure is routed like any other credential: recoverable
    // challenges (captcha, security questions, password reset, account switch,
    // etc.) are surfaced by the cases below, and only a terminal/unrecognized
    // error falls through to the default arm, where the "link expired" modal is
    // shown instead of an inline message.
    switch (errorCode) {
      case errorCodes.captcha:
        handleCaptchaError(error);
        return;
      case errorCodes.passwordResetRequired:
        handlePasswordResetRequiredError();
        return;
      case errorCodes.securityQuestionRequired:
        handleSecurityQuestionsRequiredError(error);
        return;
      case errorCodes.defaultLoginRequired:
        handleDefaultLoginRequired();
        return;
      case errorCodes.multipleUsersPerCredential:
        handleMultipleUsersPerCredentialsError(error);
        return;
      case errorCodes.emptyAccountSwitchBlobRequired:
        handleEmptyAccountSwitchBlobRequired(cType, false);
        return;
      case errorCodes.maxLoggedInAccountsLimitReached:
        handleMaxLoggedInAccountsLimitReached();
        return;

      case errorCodes.parentEmptyAccountSwitchBlobRequired:
        handleEmptyAccountSwitchBlobRequired(cType, true);
        return;

      default:
        clearCaptchaData();
        setIsLoading(false);
        incrementEphemeralCounter(mapErrorCodeToEphemeralEvent(errorCode));
        errorMessage = translate(mapLoginErrorCodeToTranslationKey(errorCode, cType));
        if (cType === CredentialType.MagicLink) {
          setErrorMsg('');
          // The magic-link redemption has failed terminally (recoverable
          // challenges are handled by the cases above). Clear the single-use
          // token so a subsequent manual login submit can't re-redeem it once
          // the "link expired" modal is dismissed.
          magicLinkTokenRef.current = null;
          setIsMagicLinkLoginErrorModalOpen(true);
        } else if (cType === CredentialType.EmailOtpSessionToken) {
          sendOtpLoginErrorEvent(String(errorCode));
          handleOtpLoginError(errorMessage, errorCode === errorCodes.credentialsNotAllowed);
        } else if (cType === CredentialType.Passkey) {
          handlePasskeyLoginError(errorMessage, errorCode === errorCodes.credentialsNotAllowed);
        } else {
          setErrorMsg(errorMessage);
        }
        setSelectedUserId(0);
    }
  };

  /*
    trigger captcha challenge when login returns captcah error
  */
  const handleCaptchaError = (error: unknown) => {
    const captchaData: TCaptchaInputParams = parseCaptchaData(error);
    incrementEphemeralCounter(eventCounters.captcha);
    handleCaptchaDataUpdated(captchaData);
  };

  /*
    The security questions handler upon triggering the challenge
  */
  const handleSecurityQuestionsRequiredError = (error: unknown) => {
    const securityQuestionsData = parseSecurityQuestionsData(error);
    incrementEphemeralCounter(eventCounters.securityQuestionRequired);
    handleSecurityQuestionsDataUpdated(securityQuestionsData);
  };
  /*
    Show security notification modal when password reset is required
  */
  const handlePasswordResetRequiredError = () => {
    incrementEphemeralCounter(eventCounters.passwordResetRequired);
    setShowSecurityNotificationModal(true);
  };

  const handleDefaultLoginRequired = () => {
    clearCaptchaData();
    setUseDefaultCredentialType(true);
    incrementEphemeralCounter(eventCounters.defaultLoginRequired);
  };

  const handleUnknownError = () => {
    setErrorMsg(translate(FeatureLoginPage.MessageUnknownErrorTryAgain));
  };

  const handleCrossDeviceLoginCodeValidated = (data: TLoginWithAuthTokenParams) => {
    setIsLoading(true);
    setCredentialType(CredentialType.AuthToken);
    setAuthTokenCode(data.code);
    setAuthTokenPrivateKey(data.privateKey);
  };

  const handleAccountSelection = (accountSelectionUserId: number): void => {
    setMultipleUsersPerCredentialData({ users: [], invalidUsers: [] });
    setSelectedUserId(accountSelectionUserId);
    sendAccountSelectionEvent(credentialType, accountSelectionUserId);
  };

  const handleAccountSelectorAbandoned = (): void => {
    setMultipleUsersPerCredentialData({ users: [], invalidUsers: [] });
    setSelectedUserId(0);
    setIsLoading(false);
    handleOtpLoginError('');
  };

  const handleMultipleUsersPerCredentialsError = (error: unknown): void => {
    // need to clear captcha data since existing captcha data will already have
    // been used once
    clearCaptchaData();
    const usersData = parseUsersData(error);
    setMultipleUsersPerCredentialData(usersData);
    const userIDsCsv = usersData.users.map(user => user.id).join(',');
    sendAccountSelectorLoadEvent(usersData.users.length, userIDsCsv, credentialType);
  };

  const handleEmptyAccountSwitchBlobRequired = (
    cType: CredentialType,
    isParentErrorVal: boolean
  ) => {
    handleEmptyAccountSwitchBlobRequiredForLogin(
      translate,
      handleSubmit,
      () => {
        if (cType === CredentialType.EmailOtpSessionToken) {
          handleAccountSelectorAbandoned(); // clean up stale state values
          // close modal using event
          window.dispatchEvent(
            new CustomEvent<TEnterCodeErrorEvent>('onEnterEmailVerifyCodeError', {
              detail: { errorMessage: '', shouldCloseModal: true }
            })
          );
        }
      },
      isParentErrorVal
    );
    setIsLoading(false);
  };

  const handleMaxLoggedInAccountsLimitReached = () => {
    setHasMaxLoggedInAccountsLoginError(true);
    setIsLoading(false);
  };

  const handleOtpLoginSubmit = (sessionToken: string, code: string) => {
    setCredentialType(CredentialType.EmailOtpSessionToken);
    setOtpLoginSessionToken(sessionToken);
    setOtpLoginCode(code);
  };

  const handlePasskeyLoginSubmit = (sessionToken: string, code: string) => {
    setCredentialType(CredentialType.Passkey);
    setPasskeyLoginSessionToken(sessionToken);
    setPasskeyLoginCode(code);
  };

  const handleOtpLoginAbandoned = () => {
    setCredentialType(CredentialType.Username);
    setOtpLoginSessionToken('');
    setOtpLoginCode('');
  };

  const handleOtpLoginError = (errorMessage: string, isUserUnder13 = false) => {
    let shouldCloseModal = false;
    let otpErrorMessage = errorMessage;
    if (selectedUserId > 0 || isUserUnder13) {
      shouldCloseModal = true;
      otpErrorMessage = '';
      setErrorMsg(errorMessage);
    }
    window.dispatchEvent(
      new CustomEvent<TEnterCodeErrorEvent>('onEnterEmailVerifyCodeError', {
        detail: { errorMessage: otpErrorMessage, shouldCloseModal }
      })
    );
    // clear otp login code so subsequent request triggers submit even if
    // user tries the same code
    setOtpLoginCode('');
  };

  const refetchPasskeyChallenge = () => {
    // Increment passkey attempts to trigger fetch of a new challenge.
    setPasskeyAttempt(passkeyAttempt + 1);
    // Clear passkey login code and session token
    setPasskeyLoginCode('');
    setPasskeyLoginSessionToken('');
  };

  const handlePasskeyLoginError = (errorMessage: string, isUserUnder13 = false) => {
    setErrorMsg(errorMessage);
    refetchPasskeyChallenge();
  };

  const openOtpLoginModal = (): void => {
    sendOtpLoginButtonClickEvent();
    if (EmailVerifyCodeModalService) {
      const params: EmailVerifyCodeModalParams = {
        containerId: containerConstants.otpLoginContainer,
        codeLength: otpLoginCodeLength,
        onEmailCodeEntered: handleOtpLoginSubmit,
        onModalAbandoned: handleOtpLoginAbandoned,
        enterEmailTitle: translate(FeatureLoginPage.LabelGetOneTimeCode),
        enterEmailDescription: translate(FeatureLoginPage.DescriptionGetOneTimeCodeHelp),
        enterCodeTitle: translate(FeatureLoginPage.LabelEnterOneTimeCode),
        enterCodeDescription: translate(FeatureLoginPage.DescriptionEnterOneTimeCodeHelp),
        origin: otpOrigin,
        translate,
        isChangeEmailEnabled: isOneTimeCodeDesignUpdated
      };
      EmailVerifyCodeModalService.renderEmailVerifyCodeModal(params);
    }
  };

  // When hitting challenge invalidated or abandoned, clear states so that
  // subsequent requests can start from blank state
  const clearPostSubmitState = (errorMessage = '') => {
    clearCaptchaData();
    setSelectedUserId(0);
    handleOtpLoginError(errorMessage);
    setIsLoading(false);
  };

  const buildLoginParams = (): TLoginParams => {
    let params: TLoginParams;

    if (credentialType === CredentialType.MagicLink && magicLinkTokenRef.current) {
      params = {
        ctype: credentialType,
        cvalue: magicLinkTokenRef.current,
        password: magicLinkTokenRef.current
      };
    } else if (credentialType === CredentialType.AuthToken) {
      params = {
        ctype: credentialType,
        cvalue: authTokenCode,
        password: authTokenPrivateKey
      };
    } else if (credentialType === CredentialType.EmailOtpSessionToken) {
      params = {
        ctype: credentialType,
        cvalue: otpLoginSessionToken,
        password: otpLoginCode
      };
    } else if (credentialType === CredentialType.Passkey) {
      params = {
        ctype: credentialType,
        cvalue: passkeyLoginCode,
        password: passkeyLoginSessionToken
      };
    } else {
      params = {
        ctype: useDefaultCredentialType ? CredentialType.Username : credentialType,
        cvalue: credentialValue,
        password
      };
    }

    // attach captcha data only they exist
    if (captchaId && captchaToken) {
      params.captchaId = captchaId;
      params.captchaToken = captchaToken;
    }
    // attach security questions data if they exist
    if (securityQuestionsSessionId && securityQuestionsRedemptionToken) {
      params.securityQuestionSessionId = securityQuestionsSessionId;
      params.securityQuestionRedemptionToken = securityQuestionsRedemptionToken;

      // These parameters should only be used once, so we reset them after
      // copying them over to the parameters.
      setSecurityQuestionsSessionId('');
      setSecurityQuestionsRedemptionToken('');
    }
    if (isAccountSwitchingEnabledForBrowser) {
      // attach accountBlob if it exists
      const accountBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob();
      if (accountBlob) {
        params.accountBlob = accountBlob;
      }
    }
    return params;
  };

  const loginWithParams = async (params: TLoginParams) => {
    try {
      const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
      const authParams = { ...params, secureAuthenticationIntent };
      const result: TLoginResponse = await login(authParams as TLoginParams);
      if (authParams.secureAuthenticationIntent) {
        incrementEphemeralCounter(eventCounters.successWithSAI);
      }
      if (dataStores?.authIntentDataStore?.hasUnclaimedAuthIntent()) {
        incrementEphemeralCounter(eventCounters.successWithGameIntent);
      }
      incrementEphemeralCounter(eventCounters.success);
      handlePostLogin(result);
    } catch (error) {
      handleLoginError(error, params.ctype);
    }
  };

  /*
  This function is flexible enough to handle the following cases.
     1. login with username/email/phone after login button is clicked.
     2. login with username/email/phone after captcha passes.
     3. login with username/email/phone after security questions pass.
     4. login with auth token after the token is validated.
     5. login with auth token after captha passes.
     6. login with username after use default login error is thrown for all number usernames.
     7. login with email/phone and userId after account selection
     8. login after the login confirmation modal (for logging out of all other account switching accounts) confirmation is pressed
     9. login after the passkey prompt is selected (OS/browser modals)
     10. login with magic link token
  */
  const handleSubmit = (isFromLoginButtonClick = true) => {
    const params = buildLoginParams();
    if (selectedUserId) {
      params.userId = selectedUserId;
    }
    if (isFromLoginButtonClick) {
      if (!credentialValue || !password) {
        setErrorMsg(translate(FeatureLoginPage.MessageUsernameAndPasswordRequired));
        return;
      }
      sendLoginButtonClickEvent();
      incrementEphemeralCounter(eventCounters.attempt);
      if (isFirstAttempt) {
        incrementEphemeralCounter(eventCounters.firstAttempt);
        isFirstAttempt = false;
      }
    }
    setIsLoading(true);
    // eslint-disable-next-line no-void
    void loginWithParams(params);
  };

  const handleAccountLimitConfirmation = () => {
    setIsNavigating(true);
    navigateToPage(getRedirectUrl());
  };

  const attemptPasskeyLogin = async (mediation = 'conditional') => {
    // network call to get passkey challenge to sign.
    let challenge = null;
    try {
      challenge = await getPasskeyChallenge();
      // signed passkeyCredential to be sent.
    } catch (error) {
      return;
    }

    try {
      const signedCreds = await signPasskeyCredential(
        challenge.authenticationOptions,
        mediation,
        passkeyAbortControllerRef.current.signal
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const code = fido2Util.formatCredentialAuthenticationResponseWeb(
        signedCreds as PublicKeyCredential
      );
      handlePasskeyLoginSubmit(challenge.sessionId, code);
    } catch (error) {
      // If this rejection is the result of an abort signal, instantiate a new AbortController so we can retry the get operation if necessary.
      // This explicit any cast is required to get around a TS bug that complains about unknown/any type.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      if ((error as any)?.name === 'AbortError') {
        passkeyAbortControllerRef.current = new AbortController();
      } else {
        // This case is unexpected, but if it were to be hit, this information would likely be helpful to display to console.
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  };

  // change this into a custom hook eventually, so that other experiment
  // parameters can be fetched easily in the future
  const setExperimentState = async (): Promise<void> => {
    const otpMetadata = await getOtpMetadata(otpOrigin);
    if (otpMetadata) {
      setIsOtpLoginEnabled(otpMetadata.IsOtpEnabled ?? false);
      setOtpCodeLength(otpMetadata.OtpCodeLength ?? 0);
    }
  };

  // eslint-disable-next-line no-void
  useEffect(() => void setExperimentState(), []);

  useEffect(() => {
    sendAuthPageLoadEvent(EVENT_CONSTANTS.context.loginPage);
  }, []);

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromReturnUrl }
      } = dataStores;
      saveGameIntentFromReturnUrl();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('intent saving error: ', e);
    }
  }, []);

  useEffect(() => {
    const updatePasskeySupportState = async () => {
      if (window.PublicKeyCredential) {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const [isCMA, isUVPAA, capabilities] = await Promise.all([
          (window.PublicKeyCredential as any).isConditionalMediationAvailable?.(),
          (window.PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable?.(),
          (window.PublicKeyCredential as any).getClientCapabilities?.()
        ]);
        // below checks are required for certain browsers (such as webviews) which use a
        // non-standard implementation of the WebAuthn API
        const hasPasskeyCapability = Boolean(
          capabilities?.passkeyPlatformAuthenticator ||
            capabilities?.userVerifyingPlatformAuthenticator
        );
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const hasPlatformAuthenticatorSupport = Boolean(isCMA || isUVPAA || hasPasskeyCapability);
        const hasConditionalMediationSupport = Boolean(isCMA);
        setIsPasskeyLoginSupported(hasPlatformAuthenticatorSupport);
        setIsConditionalMediationSupported(hasConditionalMediationSupport);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const hasConditionalCreateSupport = Boolean(capabilities?.conditionalCreate);
        setIsConditionalCreateSupported(hasConditionalCreateSupport);
        sendPlatformAuthenticatorSupportPageLoadEvent(hasPlatformAuthenticatorSupport);
        sendPasskeyLoginPageLoadEvent(hasConditionalMediationSupport);
      } else {
        setIsPasskeyLoginSupported(false);
        setIsConditionalMediationSupported(false);
        setIsConditionalCreateSupported(false);
        sendPlatformAuthenticatorSupportPageLoadEvent(false);
        sendPasskeyLoginPageLoadEvent(false);
      }
    };

    void updatePasskeySupportState();
  }, []);

  // Passkey call. Always calls- will probably break on unsupported browsers.
  useEffect(() => {
    // Check if passkey and conditional mediation are enabled.
    if (isPasskeyLoginEnabled() && isConditionalMediationSupported) {
      void attemptPasskeyLogin('conditional');
    }
    // send signedChallenge to finish endpoint.
  }, [passkeyAttempt, isConditionalMediationSupported]);

  // Send the passkeys
  useEffect(() => {
    if (passkeyLoginSessionToken && passkeyLoginCode) {
      handleSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passkeyLoginCode, passkeyLoginSessionToken]);

  // Determine whether a new submit is required because Security Questions
  // parameters have been populated.
  useEffect(() => {
    if (securityQuestionsSessionId && securityQuestionsRedemptionToken) {
      handleSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [securityQuestionsSessionId && securityQuestionsRedemptionToken]);

  useEffect(() => {
    // use auth token login only after having auth token private key and code,
    // handleSubmit will handle captcha or security questions if needed.
    if (authTokenPrivateKey && authTokenCode) {
      handleSubmit(false);
    }
  }, [authTokenPrivateKey, authTokenCode]);

  useEffect(() => {
    // use otp login only after having otp seesion token and code,
    // handleSubmit will handle captcha or security questions if needed.
    if (otpLoginSessionToken && otpLoginCode) {
      handleSubmit(false);
    }
  }, [otpLoginSessionToken, otpLoginCode]);

  useEffect(() => {
    // Redeem a magic-link token by prefilling the MagicLink credential and
    // submitting through the standard login flow (handleSubmit -> buildLoginParams),
    // exactly like the auth-token/otp/passkey credentials above. The token stays
    // available for recoverable challenges (e.g. security questions) and is only
    // cleared once the redemption fails terminally (see handleLoginError), so a
    // later credential-type change from typing a username no longer re-redeems it.
    if (!magicLinkTokenRef.current) {
      return;
    }
    if (credentialType !== CredentialType.MagicLink) {
      removeMagicLinkTokenFromUrl();
      setCredentialType(CredentialType.MagicLink);
      return;
    }
    handleSubmit(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialType]);

  useEffect(() => {
    if (useDefaultCredentialType) {
      handleSubmit(false);
    }
  }, [useDefaultCredentialType]);

  useEffect(() => {
    if (selectedUserId) {
      handleSubmit(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // If available, log available accounts that user can switch into
    if (
      !isGettingLoggedInUsers &&
      isAccountSwitcherHookCompleted &&
      isAccountSwitchingEnabledForBrowser
    ) {
      const userIds = loggedInUsers?.usersAvailableForSwitching?.map(user => user.id).join(',');
      sendAvailableAccountsForSwitchingOnPageLoadEvent(userIds);
    }
  }, [
    loggedInUsers,
    isGettingLoggedInUsers,
    isAccountSwitchingEnabledForBrowser,
    isAccountSwitcherHookCompleted
  ]);

  useRedirectHomeIf(
    authenticatedUser.isAuthenticated &&
      isAccountSwitcherHookCompleted &&
      !isAccountSwitchingEnabledForBrowser &&
      !isMagicLinkLogin
  );

  const shouldShowAccountSwitcher =
    isAccountSwitcherOpen &&
    !isMagicLinkLogin &&
    !isParentUserUrl &&
    ((authenticatedUser.isAuthenticated &&
      shouldOpenSwitchAccountFromQueryString() &&
      isAccountSwitchingEnabledForBrowser) ||
      (!authenticatedUser.isAuthenticated && !!loggedInUsers?.usersAvailableForSwitching?.length));
  const shouldShowLoginForm = !shouldShowAccountSwitcher || authenticatedUser.isAuthenticated;

  const shouldShowPasskeyLoginButton = false;
  // TODO: Debug why passkey doesn't work on studio before re-enabling
  // isPasskeyLoginEnabled() && isPasskeyLoginSupported && !isConditionalMediationSupported;

  if (isGettingLoggedInUsers || isNavigating) {
    return <Loading />;
  }

  const loginBaseContainerClass = 'login-base-container';

  const loginBase = (
    <div id='login-base' className={loginBaseContainerClass}>
      {/* only shows account switcher when logged out or opened by an authenticated deep link */}
      {shouldShowAccountSwitcher && (
        <LoginAccountSwitcher
          containerId={containerConstants.reactLoginAccountSwitcherContainer}
          titleText={translate(FeatureLoginPage.HeadingYouHaveLoggedOut)}
          helpText={translate(FeatureLoginPage.LabelChooseAccountToUse)}
          onAccountSwitched={navigatePostAccountSwitch}
          handleAddAccount={() => {
            if (authenticatedUser.isAuthenticated) {
              const redirectUrl = getRedirectUrl();
              if (isAuthorizeRobloxOAuthReturnUrl(redirectUrl)) {
                navigateToLogin();
              } else {
                navigateToPage('/login');
              }
            } else {
              setIsAccountSwitcherOpen(false);
            }
          }}
          removeInvalidActiveUser={!authenticatedUser.isAuthenticated}
          isModal={authenticatedUser.isAuthenticated}
          translate={translate}
          loggedInUsers={authenticatedUser.isAuthenticated ? undefined : loggedInUsers}
        />
      )}
      {shouldShowLoginForm && (
        <div className='section-content login-section'>
          <h1 className='login-header'>
            {buildLoginFormHeaderText(
              authenticatedUser.isAuthenticated,
              translate,
              !!loggedInUsers?.usersAvailableForSwitching?.length
            )}
          </h1>
          <LoginForm
            captchaId={captchaId}
            captchaToken={captchaToken}
            credentialValue={credentialValue}
            password={password}
            isLoading={isLoading}
            errorMsg={errorMsg}
            translate={translate}
            onFormSubmit={handleSubmit}
            onCredentialValueChange={handleCredentialValueChange}
            onPasswordChange={handlePasswordChange}
            isLoginFormDisabled={loggedInUsers?.isAccountLimitReached ?? false}
          />
          <ForgotCredentialLink credentialValue={credentialValue} translate={translate} />
          <LoginAlternative
            onCrossDeviceLoginCodeValidated={handleCrossDeviceLoginCodeValidated}
            isOtpLoginEnabled={isOtpLoginEnabled}
            openOtpLoginModal={openOtpLoginModal}
            showPasskeyLoginButton={shouldShowPasskeyLoginButton}
            openPasskeyLoginFlow={attemptPasskeyLogin}
            isOneTimeCodeDesignUpdated={isOneTimeCodeDesignUpdated}
            translate={translate}
          />
          <div id='crossDeviceLoginDisplayCodeModal-container' />
          <div id={containerConstants.otpLoginContainer} />
          <div id={accountSwitcherConfirmationModalContainer} />
          {showSecurityNotificationModal && (
            <SecurityNotificationModal credentialValue={credentialValue} translate={translate} />
          )}
          <MagicLinkLoginErrorModal
            isOpen={isMagicLinkLoginErrorModalOpen}
            onClose={() => setIsMagicLinkLoginErrorModalOpen(false)}
            translate={translate}
          />
          <SignupLink />
        </div>
      )}
      {unifiedCaptchaId && dataExchange && (
        <CaptchaComponent
          containerId={containerConstants.reactCaptchaContainer}
          actionType={AccountIntegrityChallengeService.Captcha.ActionType.Login}
          unifiedCaptchaId={unifiedCaptchaId}
          dataExchange={dataExchange}
          onCaptchaChallengeCompleted={handleCaptchaChallengeCompleted}
          onCaptchaChallengeInvalidated={handleCaptchaChallengeInvalidated}
          onCaptchaChallengeAbandoned={handleCaptchaChallengeAbandoned}
          onUnknownError={handleUnknownError}
        />
      )}
      {userId && securityQuestionsSessionId && (
        <LoginSecurityQuestions
          userId={userId}
          sessionId={securityQuestionsSessionId}
          onSecurityQuestionsChallengeCompleted={handleSecurityQuestionsChallengeCompleted}
          onSecurityQuestionsChallengeInvalidated={handleSecurityQuestionsChallengeInvalidated}
          onSecurityQuestionsChallengeAbandoned={handleSecurityQuestionsChallengeAbandoned}
          onUnknownError={handleUnknownError}
        />
      )}
      {userId && challengeId && (
        <Login2sv
          userId={userId}
          challengeId={challengeId}
          on2svChallengeCompleted={handle2svChallengeCompleted}
          on2svChallengeInvalidated={handle2svChallengeInvalidated}
          on2svChallengeAbandoned={handle2svChallengeAbandoned}
          onUnknownError={handleUnknownError}
        />
      )}
      <LoginIdVerification
        identityVerificationLoginTicket={identityVerificationLoginTicket}
        translate={translate}
      />
      {multipleUsersPerCredentialData.users.length > 0 && (
        <AccountSelectorComponent
          containerId={containerConstants.reactAccountSelectorContainer}
          users={multipleUsersPerCredentialData.users}
          // since we are not allowing u13 users to login with otp for now,
          // there will not be invalid users
          invalidUsers={[]}
          onAccountSelection={handleAccountSelection}
          onAccountSelectorAbandoned={handleAccountSelectorAbandoned}
          titleText={translate(FeatureLoginPage.LabelAccountSelector)}
          helpText={buildAccountSelectorHelpText(credentialType, translate)}
          translate={translate}
        />
      )}
      <AccountSwitcherRestrictionComponent
        origin={confirmationModalOrigins.LoginAccountLimit}
        containerId={containerConstants.reactAccountLimitErrorContainer}
        handleRedirectHome={handleAccountLimitConfirmation}
        hasMaxLoggedInAccountsSignupError={hasMaxLoggedInAccountsLoginError}
        isAccountLimitReached={loggedInUsers.isAccountLimitReached}
        translate={translate}
        isParentUser={isParentUserUrl}
      />
    </div>
  );

  const countryRatingLogos = (
    <div>
      <CountryRatingLogos
        shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
        shouldDisplayItalyRatingLogo={false}
        translate={translate}
      />
    </div>
  );

  if (isLoginBackgroundImageEnabled && loginBackgroundClass) {
    return (
      <div id='background-image' className={`background-image ${loginBackgroundClass}`}>
        <div className='login-content-wrapper'>
          {loginBase}
          {countryRatingLogos}
        </div>
      </div>
    );
  }
  return (
    <React.Fragment>
      {loginBase}
      {countryRatingLogos}
    </React.Fragment>
  );
};

export default withTranslations(LoginBase, loginTranslationConfig);
