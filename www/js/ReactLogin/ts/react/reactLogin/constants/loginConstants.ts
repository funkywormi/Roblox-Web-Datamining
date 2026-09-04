import { EnvironmentUrls, Endpoints } from 'Roblox';
import passkeySessionStorageKeys from '../../common/constants/passkeyUpgradeConstants';

const { getAbsoluteUrl } = Endpoints;

export const urlConstants = {
  securityNotification: `${EnvironmentUrls.websiteUrl}/login/securityNotification`,
  koreaIdVerification: `${EnvironmentUrls.websiteUrl}/id-verification/korea/login`,
  forgotCredentialsUrl: `${EnvironmentUrls.websiteUrl}/login/forgot-password-or-username`
};

export const loginFormStrings = {
  ActionSignIn: 'Action.SignIn',
  ActionSignInSentenceCase: 'Heading.SignIn',
  ActionForgotPasswordOrUsernameQuestionCapitalized:
    'Action.ForgotPasswordOrUsernameQuestionCapitalized',
  ActionForgotPasswordOrUsernameQuestion: 'Action.ForgotPasswordOrUsernameQuestion',
  LabelOr: 'Label.Or',
  ActionEmailMeALoginCode: 'Action.EmailMeALoginCode',
  ActionEmailACode: 'Action.EmailACode',
  ActionUseAnotherDevice: 'Action.UseAnotherDevice',
  ActionUseAnotherDeviceSentenceCase: 'Action.UseAnotherDeviceSentenceCase',
  AuthenticationQuickSignInLowercase: 'Authentication.QuickSignInLowercase',
  LabelNoAccount: 'Label.NoAccount',
  ActionCreateANewAccount: 'Action.CreateANewAccount',
  LabelDontHaveAnAccountCreateOne: 'Label.DontHaveAnAccountCreateOne',
  LabelUsernameEmailOrPhone: 'Label.UsernameEmailOrPhone',
  LabelPassword: 'Label.Password',
  HeadingContinueToEnjoyRoblox: 'Heading.ContinueToEnjoyRoblox',
  HeadingAddAccount: 'Heading.AddAccount',
  HeadingSignIn: 'Heading.SignIn',
  LabelJumpBackIn: 'Label.JumpBackIn',
  HeaderJumpBackIn: 'Header.JumpBackIn'
};

export const loginAccountSwitcherStrings = {
  HeaderChooseAnAccount: 'Header.ChooseAnAccount',
  HeaderPickUpWhereYouLeftOff: 'Header.PickUpWhereYouLeftOff',
  ActionSignInToAnotherAccount: 'Action.SignInToAnotherAccount',
  ActionCreateAccountFromSwitcher: 'Action.CreateAccountFromSwitcher'
};

export const counterConstants = {
  prefix: 'WebsiteLogin_',
  firstAttempt: 'FirstAttempt',
  attempt: 'Attempt',
  success: 'Success',
  captcha: 'Captcha',
  passwordResetRequired: 'PasswordResetRequired',
  unverifiedAccount: 'UnverifiedAccount',
  invalidCredentials: 'InvalidCredentials',
  accountNotFound: 'AccountNotFound',
  noPassword: 'NoPassword',
  accountIssue: 'AccountIssue',
  tooManyAttempts: 'TooManyAttempts',
  defaultLoginRequired: 'DefaultLoginRequired',
  redirectToLogin: 'RedirectToLogin',
  captchaLoadFailed: 'CaptchaLoadFailed',
  captchaVerifyFailed: 'CaptchaVerifyFailed',
  captchaUnknownError: 'CaptchaUnknownError',
  luoBuUserDenied: 'LuoBuUserDenied',
  screentimeRestricted: 'ScreenTimeRestricted',
  unknownError: 'UnknownError'
};

export const containerConstants = {
  react2svContainer: 'react-2sv-container',
  reactCaptchaContainer: 'react-captcha-container',
  reactSecurityQuestionsContainer: 'react-security-questions-container',
  reactAccountSelectorContainer: 'react-account-selector-container',
  otpLoginContainer: 'otp-login-container',
  reactLoginAccountSwitcherContainer: 'react-login-account-switcher-container',
  reactAccountLimitErrorContainer: 'react-login-account-limit-error-container',
  accountSwitcherConfirmationModalContainer: 'account-switcher-confirmation-modal-container'
};

export const errorCodes = {
  unknownError: 0,
  badCredentials: 1,
  captcha: 2,
  accountNotFound: 3,
  passwordResetRequired: 4,
  noPassword: 5,
  accountIssue: 6,
  tooManyAttempts: 7,
  defaultLoginRequired: 9,
  unverifiedCredentials: 10,
  captchaLoadFailed: 11,
  captchaVerifyFailed: 12,
  captchaUnknownError: 13,
  luoBuUserDenied: 14,
  screentimeRestricted: 16,
  securityQuestionRequired: 18,
  securityQuestionFailed: 19,
  multipleUsersPerCredential: 20,
  credentialsNotAllowed: 22,
  loginBlocked: 23,
  emptyAccountSwitchBlobRequired: 24,
  maxLoggedInAccountsLimitReached: 25,
  parentEmptyAccountSwitchBlobRequired: 26,
  passkeyOnlyAccount: 28
};

export const retryAttempts = {
  maxInvalidated2svChallengeAttempts: 3
};

export const eventCounters = {
  prefix: 'WebsiteLogin_',
  firstAttempt: 'FirstAttempt',
  attempt: 'Attempt',
  successWithSAI: 'SuccessWithSAI',
  successWithGameIntent: 'SuccessWithGameIntent',
  success: 'Success',
  captcha: 'Captcha',
  passwordResetRequired: 'PasswordResetRequired',
  unverifiedAccount: 'UnverifiedAccount',
  invalidCredentials: 'InvalidCredentials',
  accountNotFound: 'AccountNotFound',
  noPassword: 'NoPassword',
  accountIssue: 'AccountIssue',
  tooManyAttempts: 'TooManyAttempts',
  defaultLoginRequired: 'DefaultLoginRequired',
  redirectToLogin: 'RedirectToLogin',
  captchaLoadFailed: 'CaptchaLoadFailed',
  captchaVerifyFailed: 'CaptchaVerifyFailed',
  captchaUnknownError: 'CaptchaUnknownError',
  luoBuUserDenied: 'LuoBuUserDenied',
  screentimeRestricted: 'ScreenTimeRestricted',
  unknownError: 'UnknownError',
  securityQuestionRequired: 'SecurityQuestionRequired'
};

export const isNewLoginQueryString = 'nl=true';

export const otpOrigin = 'login';

export const experimentLayer = 'Website.Login';

// Absolute url for signup in account switching
export const accountSwitchingSignupUrl = getAbsoluteUrl('/CreateAccount');

export const loginCustomEvent = 'Roblox.Login';

export { passkeySessionStorageKeys };
