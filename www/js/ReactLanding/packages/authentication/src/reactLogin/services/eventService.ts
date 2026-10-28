import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { CredentialType } from "@rbx/authentication-common/types/loginTypes";
import { getAssignedAuthUiVariant } from "@rbx/authentication-common/utils/authUiVariantUtils";
import type { SsoProvider } from "../../shared/types/ssoTypes";
import {
  getTraceIdFromUrl,
  STUDIO_TRACE_ID_PARAM,
} from "@rbx/authentication-common/utils/traceIdUtils";

const { eventTypes } = eventStreamService;

const sendEventWithTraceId = (
  eventName: string,
  context: string,
  props: Record<string, string>,
): void => {
  const traceId = getTraceIdFromUrl();
  eventStreamService.sendEventWithTarget(eventName, context, {
    ...props,
    ...(traceId ? { [STUDIO_TRACE_ID_PARAM]: traceId } : {}),
  });
};

// Send cross device login button click event
export const sendXdlButtonClickEvent = (): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.loginPage, {
    field: EVENT_CONSTANTS.field.loginOtherDevice,
    aType: EVENT_CONSTANTS.aType.click,
  });
};

export const sendLoginButtonClickEvent = (): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.loginPage, {
    field: EVENT_CONSTANTS.field.loginSubmitButtonName,
    aType: EVENT_CONSTANTS.aType.click,
  });
};

export const sendOtpLoginButtonClickEvent = (): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.loginPage, {
    field: EVENT_CONSTANTS.field.loginOTP,
    aType: EVENT_CONSTANTS.aType.click,
  });
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      btn: EVENT_CONSTANTS.field.OTP,
    },
  );
};

export const sendOtpLoginErrorEvent = (errorCode: string): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.enterOTP, {
    field: EVENT_CONSTANTS.field.errorMessage,
    aType: EVENT_CONSTANTS.aType.shown,
    btn: EVENT_CONSTANTS.btn.login,
    errorCode,
  });
};

type TLoginFormInteractionEventInput = {
  field: string;
  aType: string;
};

const sendLoginFormInteractionEvent = (param: TLoginFormInteractionEventInput) => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.loginForm, {
    field: param.field,
    aType: param.aType,
  });
};

export const sendUsernameFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.username,
    aType: EVENT_CONSTANTS.aType.focus,
  });
};

export const sendUsernameOffFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.username,
    aType: EVENT_CONSTANTS.aType.offFocus,
  });
};

export const sendPasswordFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.password,
    aType: EVENT_CONSTANTS.aType.focus,
  });
};

export const sendPasswordOffFocusEvent = (): void => {
  sendLoginFormInteractionEvent({
    field: EVENT_CONSTANTS.field.password,
    aType: EVENT_CONSTANTS.aType.offFocus,
  });
};

export const sendAccountSelectorLoadEvent = (
  numUsers: number,
  userIDsCsv: string,
  credentialType: CredentialType,
): void => {
  // TODO: account selection events for other credential types
  if (credentialType === CredentialType.EmailOtpSessionToken) {
    sendEventWithTraceId(eventTypes.pageLoad, EVENT_CONSTANTS.context.disambiguationOTP, {
      numUsers: String(numUsers),
    });
    sendEventWithTraceId(
      EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
      EVENT_CONSTANTS.context.disambigOTP,
      {
        state: userIDsCsv,
      },
    );
  }
};

export const sendAccountSelectionEvent = (
  credentialType: CredentialType,
  accountSelectionUserId: number,
): void => {
  // TODO: account selection events for other credential types
  if (credentialType === CredentialType.EmailOtpSessionToken) {
    sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.disambiguationOTP, {
      field: EVENT_CONSTANTS.field.accountSelection,
    });
    sendEventWithTraceId(
      EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EVENT_CONSTANTS.context.disambigOTP,
      {
        btn: EVENT_CONSTANTS.btn.select,
        state: String(accountSelectionUserId),
      },
    );
  } else {
    sendEventWithTraceId(eventTypes.formInteraction, "", {
      field: EVENT_CONSTANTS.field.accountSelection,
    });
  }
};

/**
 * If account switcher is enabled and user is on login page, send an event to record available accounts for switching.
 * @param userIdsCsv Comma separated list of user IDs
 */
export const sendAvailableAccountsForSwitchingOnPageLoadEvent = (userIdsCsv: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.accountSwitcherLogin,
    {
      state: userIdsCsv,
      field: EVENT_CONSTANTS.field.accountSwitcher,
    },
  );
};

/*
 * Log event for when the user logs out of all currently logged-in accounts. Most likely due to logging into an underage account.
 */
export const sendLogoutAllAccountsOnLoginEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.loginPage,
    {
      btn: EVENT_CONSTANTS.btn.logoutAll,
      origin: EVENT_CONSTANTS.origin.login,
    },
  );
};

export const sendPasskeyLoginPageLoadEvent = (supported: boolean): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.passkeyLogin,
    {
      state: String(supported),
    },
  );
};

export const sendPlatformAuthenticatorSupportPageLoadEvent = (supported: boolean): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.platformAuthenticatorSupport,
    {
      state: String(supported),
    },
  );
};

// Schematized event helpers for revamped login form (lrLoginForm)
export const sendAuthButtonClickEvent = (btn: string, state: string, ctx: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, ctx, {
    btn,
    state,
  });
};

export const sendAuthPageLoadEvent = (ctx: string, state?: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    ctx,
    state ? { state } : {},
  );
};

export const sendAuthFormInteractionEvent = (ctx: string, field: string, state: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, ctx, {
    field,
    state,
  });
};

export const sendAuthMsgShownEvent = (ctx: string, field: string, errorCode: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authMsgShown, ctx, {
    field,
    errorCode,
  });
};

const ssoProviderButtons: Readonly<Record<SsoProvider, string>> = {
  google: EVENT_CONSTANTS.btn.googleSso,
  apple: EVENT_CONSTANTS.btn.appleSso,
};

// The button events have no `field` column, so placement goes in `state`.
export type LoginSsoButtonPlacement = "underDivider" | "otherSignInOptions";

/**
 * Both login UIs send the same events, so the arm on the page load is what splits their funnels
 * without joining to IXP exposure. Later events don't repeat it; join them on BTID.
 */
export const sendLoginPageLoadEvent = (): void => {
  const authUiVariant = getAssignedAuthUiVariant();
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.loginPage,
    authUiVariant ? { origin: authUiVariant } : {},
  );
};

export const sendLoginSsoButtonShownEvent = (
  provider: SsoProvider,
  placement: LoginSsoButtonPlacement,
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonShown,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      btn: ssoProviderButtons[provider],
      state: placement,
    },
  );
};

export const sendLoginSsoButtonClickEvent = (
  provider: SsoProvider,
  placement: LoginSsoButtonPlacement,
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      btn: ssoProviderButtons[provider],
      state: placement,
    },
  );
};

export const sendLoginOtherSignInOptionsClickEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    { btn: EVENT_CONSTANTS.btn.otherSignInOptions },
  );
};

export const sendLoginOtherSignInOptionsShownEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      state: EVENT_CONSTANTS.aType.shown,
      field: EVENT_CONSTANTS.field.loginOtherSignInOptionsModal,
    },
  );
};

/**
 * The Foundation dialog doesn't say whether its X, Escape, or the backdrop closed it, so web
 * sends one `dismiss` button where Lua splits `dismissCornerX` from `dismissSheet`.
 */
export const sendLoginOtherSignInOptionsDismissedEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      btn: EVENT_CONSTANTS.btn.dismiss,
      state: EVENT_CONSTANTS.field.loginOtherSignInOptionsModal,
    },
  );
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      state: EVENT_CONSTANTS.aType.dismissed,
      field: EVENT_CONSTANTS.field.loginOtherSignInOptionsModal,
    },
  );
};

export const sendLoginLinkClickEvent = (
  btn: typeof EVENT_CONSTANTS.btn.signup | typeof EVENT_CONSTANTS.btn.forgotCredentials,
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    { btn },
  );
};

/**
 * A login request the server accepted. `state` is what comes next (`complete`, `twoStep`, or
 * `identityVerification`), so two-step verification entry is visible without a separate event.
 * `authFormInteraction` has no `ctype` column, so the method is in `entered`.
 */
export const sendLoginSucceededEvent = (method: string, nextStep: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      field: EVENT_CONSTANTS.field.loginSuccess,
      state: nextStep,
      entered: method,
    },
  );
};

/**
 * A login request the server rejected, including the captcha and challenge responses that
 * interrupt it. `state` is the failure category and `errorCode` the server's code.
 * `authMsgShown` has no `ctype` column, and passkey, magic link, and auth token logins send no
 * submit event to join on, so the method is in `field`.
 */
export const sendLoginErrorShownEvent = (
  method: string,
  reason: string,
  errorCode: number | null,
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    {
      field: method,
      state: reason,
      errorCode: errorCode === null ? "" : String(errorCode),
    },
  );
};

/**
 * Lua sends `authClientError` with the server's code on every failed login, so web does too for
 * cross-platform queries. `authClientError` has no `errorCode` column, so the code is the `state`,
 * falling back to the failure category when the server sent no code.
 */
export const sendLoginClientErrorEvent = (errorCode: number | null, reason: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    { state: errorCode === null ? reason : String(errorCode) },
  );
};

export const passkeyLoginClientErrorSteps = {
  challengeFetch: "passkeyChallengeFetch",
  credential: "passkeyCredential",
} as const;

/** `detail` is the browser's DOMException name for credential errors, such as `NotAllowedError`. */
export const sendPasskeyLoginClientErrorEvent = (
  step: (typeof passkeyLoginClientErrorSteps)[keyof typeof passkeyLoginClientErrorSteps],
  detail: string,
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    EVENT_CONSTANTS.context.schematizedLoginForm,
    { state: `${step}.${detail}` },
  );
};
