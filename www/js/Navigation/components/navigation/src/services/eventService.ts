import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import EVENT_CONSTANTS from "../constants/eventsConstants";

/**
 * Log event for logout button click
 */
export const sendLogoutButtonClickEvent = (): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.logout,
    },
  );
};

/**
 * Log event for switchAccount entrypoint button click
 */
export const sendSwitchAccountButtonClickEvent = (url: string): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.switchAccount,
      state: url,
    },
  );
};

/**
 * Log event for 401 modal shown
 */
export const sendAuth401ModalShownEvent = (): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.auth401Modal,
    {},
  );
};

/**
 * Log event for 401 modal sign in button click
 */
export const sendAuth401ModalButtonClickEvent = (): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.auth401Modal,
    {
      btn: EVENT_CONSTANTS.btn.signIn,
    },
  );
};

/**
 * Log a generic authPageLoad event with the given context and state.
 */
export const sendAuthPageLoadEvent = (context: string, state: string): void => {
  sendEventWithTarget(EVENT_CONSTANTS.schematizedEventTypes.authPageLoad, context, {
    state,
  });
};

/**
 * Log whether account switcher blob is present or not. Should be logged on page load.
 * @param boolean isBlobPresent
 */
export const sendAccountSwitcherBlobPresentOnPageLoadEvent = (isBlobPresent: boolean): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.accountSwitcherStatus,
    {
      state: isBlobPresent.toString(),
    },
  );
};

/**
 * Log authMsgShown event reporting the source flow that triggered a
 * successful passkey creation (mirrors `sendPasskeyCreationSourceEvent`
 * in account-security and account-settings).
 */
export const sendPasskeyCreationSourceEvent = (source: string): void => {
  sendEventWithTarget(
    AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
    AUTH_EVENT_CONSTANTS.context.passkeyCreationSource,
    {
      state: AUTH_EVENT_CONSTANTS.state.passkeyCreation.finishRegistration,
      field: source,
    },
  );
};

/**
 * Log a passkeyRegistrationEvent (proto: eventstream.accountauth.PasskeyRegistrationEvent).
 * `passkeyFailureReason` is omitted from the payload when not provided so the
 * field stays unset on success-path events.
 */
export const sendPasskeyRegistrationEvent = (
  source: string,
  state: string,
  passkeyFailureReason?: string,
): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.passkeyRegistrationEvent,
    EVENT_CONSTANTS.context.passkeyRegistration,
    {
      source,
      state,
      ...(passkeyFailureReason ? { passkeyFailureReason } : {}),
    },
  );
};

/**
 * Log authClientError event for cache user changed.
 */
export const sendCacheUserChangedAuthClientErrorEvent = (
  previousUserId: string,
  currentUrl: string,
): void => {
  sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    EVENT_CONSTANTS.context.cachedUserChanged,
    {
      state: previousUserId,
      url: currentUrl,
    },
  );
};

export const sendLeftSidebarEvent = (open: boolean, variant: "OLD" | "NEW"): void => {
  sendEventWithTarget("navigationSidebarToggle", "navigation", {
    open,
    variant,
  });
};
