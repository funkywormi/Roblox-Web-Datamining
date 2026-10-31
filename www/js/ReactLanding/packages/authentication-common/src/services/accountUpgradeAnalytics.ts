/* Web counterpart of lua-apps' account-upgrade AccountUpgradeAnalytics.lua (AA-7681). Every
 * EventStream event and telemetry counter the Lua client sends for the OAuth upgrade flow is
 * mirrored here with the web modal's origin, so the modal's funnel can be cut next to the Lua
 * client's. EventStream events target WWW by default; the Lua client's counters (flow, surface)
 * become dimensions here. Each call is wrapped so a telemetry error cannot break the modal.
 * The Lua birthday picker has no web counterpart: the modal's three dropdowns report the
 * picker's focus and confirm events, and nothing for its open, close, and all-picked states. */
import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import EVENT_CONSTANTS from "../constants/eventsConstants";
import { Gender } from "../types/signupTypes";

// Success rate = Success / PageMount; failure rate = Failure / PageMount.
const FEATURE_NAME = "WebAccountUpgrade";

const fireTelemetryCounter = createFireTelemetryCounter(FEATURE_NAME);

// The Lua client dimensions its counters by flow (OAuth) and surface; the web modal is one
// OAuth surface, the not-approved page.
const FLOW = "OAuth";
const COUNTER_DIMENSIONS = {
  flow: FLOW,
  surface: "NotApprovedPage",
} as const;

const ORIGIN = EVENT_CONSTANTS.origin.accountUpgradeOAuthWeb;
const CONTEXT_UPGRADE = EVENT_CONSTANTS.context.accountUpgrade;
const CONTEXT_CLOSE_WARNING = EVENT_CONSTANTS.context.accountUpgradeCloseWarning;

export const ACCOUNT_UPGRADE_COUNTERS = {
  pageMount: "PageMount",
  closeButtonClicked: "CloseButtonClicked",
  closeWarningBackButtonClicked: "CloseWarningBackButtonClicked",
  closeWarningCloseButtonClicked: "CloseWarningCloseButtonClicked",
  success: "Success",
  failure: "Failure",
  marketingConsentWriteSuccess: "MarketingConsentWriteSuccess",
  marketingConsentWriteFailure: "MarketingConsentWriteFailure",
} as const;

const safely = (report: () => void): void => {
  try {
    report();
  } catch {
    // Analytics must never break the modal; telemetry errors are swallowed.
  }
};

const sendEvent = (
  eventType: string,
  eventContext: string,
  params: Record<string, string>,
): void => {
  safely(() => {
    eventStreamService.sendEventWithTarget(eventType, eventContext, params);
  });
};

const fireCounter = (counter: string, dimensions: Record<string, string> = {}): void => {
  safely(() => {
    fireTelemetryCounter(counter, { ...COUNTER_DIMENSIONS, ...dimensions });
  });
};

// Like Lua, the events that carry no state of their own carry the flow as their state.
export const reportOpened = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authPageLoad, CONTEXT_UPGRADE, {
    state: FLOW,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.pageMount);
};

// The X always opens the close warning, so this also reports the warning as shown.
export const reportCloseButtonClicked = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_UPGRADE, {
    btn: EVENT_CONSTANTS.btn.dismissCornerX,
    state: FLOW,
    origin: ORIGIN,
  });
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authModalShown, CONTEXT_CLOSE_WARNING, {
    state: FLOW,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.closeButtonClicked);
};

export const reportCloseWarningBack = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_CLOSE_WARNING, {
    btn: EVENT_CONSTANTS.btn.back,
    state: FLOW,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.closeWarningBackButtonClicked);
};

export const reportCloseWarningClose = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_CLOSE_WARNING, {
    btn: EVENT_CONSTANTS.btn.close,
    state: FLOW,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.closeWarningCloseButtonClicked);
};

export const reportSaveClicked = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_UPGRADE, {
    btn: EVENT_CONSTANTS.btn.save,
    state: FLOW,
    origin: ORIGIN,
  });
};

// Lua reports both a birthday focus and its picker opening; the dropdowns have no picker, so
// opening any of them reports the focus alone.
export const reportBirthdayFocused = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, CONTEXT_UPGRADE, {
    field: EVENT_CONSTANTS.field.birthday,
    state: EVENT_CONSTANTS.aType.focus,
    origin: ORIGIN,
  });
};

// Stands in for the Lua picker's confirm button: sent each time the dropdowns make a complete,
// valid date.
export const reportBirthdayConfirmed = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_UPGRADE, {
    btn: EVENT_CONSTANTS.btn.confirmBirthday,
    state: FLOW,
    origin: ORIGIN,
  });
};

export const reportUsernameFocused = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, CONTEXT_UPGRADE, {
    field: EVENT_CONSTANTS.field.username,
    state: EVENT_CONSTANTS.aType.focus,
    origin: ORIGIN,
  });
};

// The chip pressed, including a press that clears the selection.
export const reportGenderActivated = (gender: Gender.male | Gender.female): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_UPGRADE, {
    btn: gender === Gender.male ? EVENT_CONSTANTS.btn.genderMale : EVENT_CONSTANTS.btn.genderFemale,
    state: FLOW,
    origin: ORIGIN,
  });
};

export const reportLegalLinkActivated = (link: "terms" | "privacy"): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, CONTEXT_UPGRADE, {
    field:
      link === "terms" ? EVENT_CONSTANTS.field.termsOfService : EVENT_CONSTANTS.field.privacyPolicy,
    state: FLOW,
    origin: ORIGIN,
  });
};

export const reportSucceeded = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authPageLoad, CONTEXT_UPGRADE, {
    state: EVENT_CONSTANTS.state.upgradeSuccess,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.success);
};

// Every failure sends authClientError; the first failure in an opening also reports the
// failure pageload and counter (Lua's hasReportedFailureRef semantics live with the caller).
export const reportFailure = (errorCode: string): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authClientError, CONTEXT_UPGRADE, {
    state: errorCode,
    origin: ORIGIN,
  });
};

export const reportFirstFailure = (errorCode: string): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authPageLoad, CONTEXT_UPGRADE, {
    state: EVENT_CONSTANTS.state.upgradeFailure,
    origin: ORIGIN,
  });
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.failure, { errorCode });
};

// Lua's usernameSuggestionShown expects a bracketed, comma-joined list and the prompt value
// the suggestions were generated from.
export const reportSuggestionsShown = (username: string, suggestions: string[]): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.usernameSuggestionShown, CONTEXT_UPGRADE, {
    state: username,
    suggestions: `[${suggestions.join(",")}]`,
    field: EVENT_CONSTANTS.field.username,
  });
};

export const reportSuggestionSelected = (suggestion: string): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, CONTEXT_UPGRADE, {
    btn: EVENT_CONSTANTS.btn.usernameSuggestion,
    state: suggestion,
    origin: ORIGIN,
  });
};

// Like Lua, the marketing email box events carry the box's checked state as `entered`.
const sendMarketingConsentEvent = (state: string, isChecked: boolean): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, CONTEXT_UPGRADE, {
    field: EVENT_CONSTANTS.field.marketingEmailConsent,
    state,
    origin: ORIGIN,
    entered: String(isChecked),
  });
};

export const reportMarketingConsentShown = (): void => {
  sendMarketingConsentEvent(EVENT_CONSTANTS.aType.shown, false);
};

export const reportMarketingConsentToggled = (isChecked: boolean): void => {
  sendMarketingConsentEvent(EVENT_CONSTANTS.aType.click, isChecked);
};

export const reportMarketingConsentSubmitted = (isChecked: boolean): void => {
  sendMarketingConsentEvent(EVENT_CONSTANTS.aType.submit, isChecked);
};

export const reportMarketingConsentAutoOptIn = (): void => {
  sendEvent(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, CONTEXT_UPGRADE, {
    field: EVENT_CONSTANTS.field.marketingEmailAutoOptIn,
    state: EVENT_CONSTANTS.aType.submit,
    origin: ORIGIN,
  });
};

export const reportMarketingConsentWriteSucceeded = (): void => {
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.marketingConsentWriteSuccess);
};

export const reportMarketingConsentWriteFailed = (errorCode: string): void => {
  fireCounter(ACCOUNT_UPGRADE_COUNTERS.marketingConsentWriteFailure, { errorCode });
};
