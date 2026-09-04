import { eventStreamService, isGoogleAnalyticsCookieConsentOptIn } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { counters } from '../constants/signupConstants';
import RobloxEventTracker from '../../common/eventTracker';
import VerifiedParentalConsentRequestType from '../enums/VerifiedParentalConsentRequestType';
import { getTraceIdFromUrl, STUDIO_TRACE_ID_PARAM } from '../../common/utils/traceIdUtils';
import {
  getSignupErrorField,
  getSignupErrorState,
  SignupErrorOutcome
} from '../utils/signupErrorUtils';
import { SignUpV2Treatment } from '../signupV2/utils/signupV2ExperimentUtils';

const { eventTypes } = eventStreamService;

const sendEventWithTraceId = (
  eventName: string,
  context: string,
  props: Record<string, string>
): void => {
  const traceId = getTraceIdFromUrl();
  const params = {
    ...props,
    ...(traceId ? { [STUDIO_TRACE_ID_PARAM]: traceId } : {})
  };
  eventStreamService.sendEventWithTarget(eventName, context, params);
};

const getVPCEventContext = (requestType: VerifiedParentalConsentRequestType) => {
  let context;
  switch (requestType) {
    case VerifiedParentalConsentRequestType.LiftPunishment:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.chargeback;
      break;
    case VerifiedParentalConsentRequestType.SavePaymentMethods:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.savePaymentMethods;
      break;
    case VerifiedParentalConsentRequestType.UpdateBirthdate:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.changeBirthdayContext;
      break;
    case VerifiedParentalConsentRequestType.LinkToChild:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.linkToChild;
      break;
    case VerifiedParentalConsentRequestType.UpdateUserSetting:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.updateUserSetting;
      break;
    default:
      context = EVENT_CONSTANTS.verifiedParentalConsentContext.chargeback;
  }
  return context;
};

const getVPCState = (sessionId?: string, settingName?: string): string => {
  let state = sessionId ? `sessionId: ${sessionId}` : '';
  state = settingName ? `${state}, settingName: ${settingName}` : state;
  return state;
};

export const incrementEphemeralCounter = (eventName: string): void => {
  if (RobloxEventTracker && eventName) {
    RobloxEventTracker.fireEvent(counters.prefix + eventName);
  }
};

export const sendConversionEvent = (callback: () => void): void => {
  const hasGAConsent = (isGoogleAnalyticsCookieConsentOptIn as () => boolean)();
  if (!hasGAConsent) {
    callback();
    return;
  }
  const gtag = window.gtag || null;
  if (typeof gtag === 'undefined' || !gtag || !gtag.conversionEvents) {
    callback();
    return;
  }
  // In case gtag fails
  const id = setTimeout(callback, 2000);
  gtag('event', 'conversion', {
    send_to: gtag.conversionEvents.signupConversionEvent,
    event_callback() {
      clearTimeout(id);
      callback();
    },
    event_timeout: 2000
  });
};

export const sendQualifiedSignupEvent = (
  referralUrl: string,
  linkId: string,
  status: 'initial' | 'error',
  linkType: string
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.qualifiedSignup,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      status,
      referralUrl,
      linkId,
      linkType
    }
  );
};

export const sendSignupButtonClickEvent = (isAltAttempt: boolean, hasAuthIntent = false): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      btn: EVENT_CONSTANTS.field.signupSubmitButtonName,
      state: hasAuthIntent ? EVENT_CONSTANTS.field.hasAuthIntent : '',
      isAltAttempt: isAltAttempt ? 'true' : 'false'
    }
  );
  // doube sending to the old origin as well
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.signupForm, {
    field: EVENT_CONSTANTS.field.signupSubmitButtonName,
    aType: EVENT_CONSTANTS.aType.click
  });
};

export const sendSchematizedSignupButtonClickEvent = (
  isAltAttempt: boolean,
  hasAuthIntent = false
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.lrSignupForm,
    {
      btn: EVENT_CONSTANTS.btn.signupSubmit,
      state: hasAuthIntent ? EVENT_CONSTANTS.field.hasAuthIntent : '',
      isAltAttempt: isAltAttempt ? 'true' : 'false'
    }
  );
};

export const sendSignupUsernameKeystrokeEvent = (
  keyPressedData: string,
  eventTypeData: string,
  timestampData: string
): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.signupUsernameKeystrokes,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      keyPressedData: JSON.stringify(keyPressedData),
      eventTypeData: JSON.stringify(eventTypeData),
      timestampData: JSON.stringify(timestampData)
    }
  );
};

export const sendAppClickEvent = (appName: string): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.landingPage, {
    field: appName + EVENT_CONSTANTS.field.appButtonClickName,
    aType: EVENT_CONSTANTS.aType.click
  });
};

export const incrementSignUpSubmitCounters = (isFirstSignUpSubmit: boolean): void => {
  incrementEphemeralCounter(counters.attempt);

  if (isFirstSignUpSubmit) {
    incrementEphemeralCounter(counters.firstAttempt);
  }
};

type TSignupFormInteractionEventInput = {
  field: string;
  aType: string;
};

const sendSignupFormInteractionEvent = (param: TSignupFormInteractionEventInput) => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.signupForm, {
    field: param.field,
    aType: param.aType
  });
};

export const sendDayFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayDay,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendDayOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayDay,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendMonthFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayMonth,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendMonthOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayMonth,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendYearFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayYear,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendYearOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.birthdayYear,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendUsernameFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupUsername,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendUsernameOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupUsername,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendPasswordFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupPassword,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendPasswordOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupPassword,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendMaleGenderFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderMale,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendMaleGenderOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderMale,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendFemaleGenderFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderFemale,
    aType: EVENT_CONSTANTS.aType.focus
  });
};

export const sendFemaleGenderOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.genderFemale,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

const sendKoreaEmailFocusEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    eventTypes.formInteraction,
    EVENT_CONSTANTS.context.signupForm,
    {
      origin: EVENT_CONSTANTS.origin.webVerifiedSignup,
      field: EVENT_CONSTANTS.field.parentEmail
    }
  );
};

export const sendEmailFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupEmail,
    aType: EVENT_CONSTANTS.aType.focus
  });
  // the angular implmentation sends two events for email focus, one from the directive for the email field
  // and another to indicate that it comes from the korea id verification flow
  sendKoreaEmailFocusEvent();
};

export const sendEmailOffFocusEvent = (): void => {
  sendSignupFormInteractionEvent({
    field: EVENT_CONSTANTS.field.signupEmail,
    aType: EVENT_CONSTANTS.aType.offFocus
  });
};

export const sendShowPasswordButtonClickEvent = (): void => {
  sendEventWithTraceId(eventTypes.buttonClick, EVENT_CONSTANTS.context.signupForm, {
    field: EVENT_CONSTANTS.field.showPassword
  });
};

export const sendHidePasswordButtonClickEvent = (): void => {
  sendEventWithTraceId(eventTypes.buttonClick, EVENT_CONSTANTS.context.signupForm, {
    field: EVENT_CONSTANTS.field.hidePassword
  });
};

export const sendUsernameSuggestionShownEvent = (
  state: string,
  suggestions: string,
  ctx: string = EVENT_CONSTANTS.context.signupForm
): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.usernameSuggestionShown, ctx, {
    state,
    suggestions
  });
};

export const sendUsernameValidationErrorEvent = (input: string, message: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input,
      msg: message,
      field: EVENT_CONSTANTS.field.signupUsername
    }
  );
};

export const sendUsernameValidationSuccessEvent = (): void => {
  sendEventWithTraceId(eventTypes.formInteraction, EVENT_CONSTANTS.context.signupForm, {
    field: EVENT_CONSTANTS.field.usernameValid
  });
};

export const sendPasswordValidationEvent = (message: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input: EVENT_CONSTANTS.input.redacted,
      msg: message,
      field: EVENT_CONSTANTS.field.signupPassword
    }
  );
};

export const sendEmailValidationEvent = (input: string, message: string): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.formValidation,
    EVENT_CONSTANTS.context.signupForm,
    {
      input,
      msg: message,
      field: EVENT_CONSTANTS.field.signupEmail
    }
  );
};

export const sendTosCheckboxClickEvent = (isChecked: boolean): void => {
  sendEventWithTraceId(eventTypes.buttonClick, EVENT_CONSTANTS.context.signupForm, {
    btn: EVENT_CONSTANTS.btn.termsOfServiceCheckbox,
    field: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked,
    origin: EVENT_CONSTANTS.origin.signup
  });
};

export const sendPrivacyPolicyboxClickEvent = (isChecked: boolean): void => {
  sendEventWithTraceId(eventTypes.buttonClick, EVENT_CONSTANTS.context.signupForm, {
    btn: EVENT_CONSTANTS.btn.privacyPolicyCheckbox,
    field: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked,
    origin: EVENT_CONSTANTS.origin.signup
  });
};

export const sendVPCSignupPageLoadEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string,
  settingName?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authPageLoad,
    context.finishParentalSignup,
    {
      state: getVPCState(sessionId, settingName),
      associatedText: EVENT_CONSTANTS.text.finishCreatingYourAccount
    }
  );
};

export const sendVPCSignupBirthdateFieldInteractedEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string,
  settingName?: string
): void => {
  const context = getVPCEventContext(requestType);

  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authFormInteraction,
    context.finishParentalSignup,
    {
      state: getVPCState(sessionId, settingName),
      field: EVENT_CONSTANTS.field.birthday
    }
  );
};

export const sendVPCSignupButtonClickedEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string,
  settingName?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    context.finishParentalSignup,
    {
      state: getVPCState(sessionId, settingName),
      btn: EVENT_CONSTANTS.btn.signup,
      associatedText: EVENT_CONSTANTS.text.createAccount
    }
  );
};

export const sendShowVPCLogoutPopupEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string,
  settingName?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authModalShown,
    context.homepage,
    {
      field: EVENT_CONSTANTS.field.logoutPopup,
      state: getVPCState(sessionId, settingName),
      associatedText: EVENT_CONSTANTS.text.logout
    }
  );
};

export const sendClickVPCLogoutPopupLogoutEvent = (
  requestType: VerifiedParentalConsentRequestType,
  sessionId?: string,
  settingName?: string
): void => {
  const context = getVPCEventContext(requestType);
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    context.homepage,
    {
      state: getVPCState(sessionId, settingName),
      btn: EVENT_CONSTANTS.btn.logoutPopupLogout,
      associatedText: EVENT_CONSTANTS.text.logout
    }
  );
};
/**
 * Log event for when the user logs out of all currently logged-in accounts. Most likely due to logging into an underage account.
 */
export const sendLogoutAllAccountsOnSignupEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.logoutAll,
      origin: EVENT_CONSTANTS.origin.signup
    }
  );
};

export const sendAuthButtonClickEvent = (
  btn: string,
  state: string,
  ctx: string,
  ctype?: string
): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, ctx, {
    btn,
    state,
    ...(ctype ? { ctype } : {})
  });
};

export const sendAuthPageLoadEvent = (ctx: string, state?: string, origin?: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authPageLoad, ctx, {
    ...(state ? { state } : {}),
    ...(origin ? { origin } : {})
  });
};

export const sendAuthFormInteractionEvent = (ctx: string, field: string, state?: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authFormInteraction, ctx, {
    field,
    ...(state && { state })
  });
};

export const sendAuthMsgShownEvent = (
  ctx: string,
  field: string,
  errorCode: string,
  state?: string
): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authMsgShown, ctx, {
    field,
    errorCode,
    ...(state ? { state } : {})
  });
};

/**
 * `elapsedTime` is an int64 on the proto; stringified here like every other
 * parameter and re-typed during schematization.
 */
export const sendAuthOperationTimingEvent = (
  ctx: string,
  state: string,
  elapsedTime: number
): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authOperationTiming, ctx, {
    state,
    elapsedTime: Math.round(elapsedTime).toString()
  });
};

export const sendKoreaConsentAllCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaConsentAllCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaTosAndPrivacyPolicyCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaTosAndPrivacyPolicyCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaThirdPartyPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaThirdPartyPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaTransferPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaTransferPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaOptionalPersonalInfoCheckboxClickEvent = (isChecked: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaOptionalPersonalInfoCheckbox,
      state: isChecked ? EVENT_CONSTANTS.field.checked : EVENT_CONSTANTS.field.unchecked
    }
  );
};

export const sendKoreaAgreeTermsOfServiceButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.koreaAgreeTermsOfService
    }
  );
};

export const sendSchematizedSignupCheckboxToggledEvent = (isChecked: boolean): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.eventName.authFormInteraction,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      field: EVENT_CONSTANTS.field.tosCheckbox,
      state: String(isChecked)
    }
  );
};

export const sendSignInButtonClickEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.signupForm,
    {
      btn: EVENT_CONSTANTS.btn.signIn
    }
  );
};

export const sendExitSignupConfirmationShownEvent = (ctx: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authModalShown, ctx, {
    field: EVENT_CONSTANTS.field.exitSignupConfirmation
  });
};

/**
 * Emit the schematized passkeyRegistrationEvent
 * (proto: eventstream.accountauth.PasskeyRegistrationEvent) from the signup
 * surface. Mirrors navigation's `sendPasskeyRegistrationEvent`;
 * `passkeyFailureReason` is omitted when not provided so the field stays unset
 * on non-error events.
 */
export const sendPasskeyRegistrationEvent = (
  source: string,
  state: string,
  passkeyFailureReason?: string
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.passkeyRegistrationEvent,
    EVENT_CONSTANTS.context.passkeyRegistration,
    {
      source,
      state,
      ...(passkeyFailureReason ? { passkeyFailureReason } : {})
    }
  );
};

/**
 * Coarse outcome of a signup-surface passkey registration attempt. Kept as a
 * standalone shape (rather than importing `usePasskeyRegistration`'s
 * `PasskeyAttemptOutcome`) so telemetry stays decoupled from the hook; the
 * signup form maps its outcome onto this when wiring emission.
 */
export type TPasskeyRegistrationOutcome =
  | { kind: 'success' }
  | { kind: 'dismissed'; reason?: string }
  | { kind: 'unsupported' }
  | { kind: 'error'; reason?: string };

const getPasskeyRegistrationOutcomeState = (outcome: TPasskeyRegistrationOutcome): string => {
  const { passkeyRegistrationState } = EVENT_CONSTANTS;
  switch (outcome.kind) {
    case 'success':
      return passkeyRegistrationState.signupPreauthCredentialCreated;
    case 'dismissed':
      return passkeyRegistrationState.signupPreauthDismissed;
    case 'unsupported':
      return passkeyRegistrationState.signupPreauthUnsupported;
    default:
      return passkeyRegistrationState.signupPreauthError;
  }
};

/**
 * Map a signup passkey registration outcome onto the corresponding
 * PasskeyRegistrationEvent `state` and emit it with `source=signup`.
 *
 * Both the `dismissed` and `error` outcomes forward their optional `reason` as
 * `passkeyFailureReason`. `dismissed` carries one because WebAuthn collapses
 * user-cancel, timeout, and several platform rejections into a single
 * `NotAllowedError`; surfacing the underlying cause keeps that distinction
 * visible in telemetry instead of flattening it to a bare dismissal.
 */
export const sendSignupPasskeyRegistrationOutcomeEvent = (
  outcome: TPasskeyRegistrationOutcome
): void => {
  sendPasskeyRegistrationEvent(
    EVENT_CONSTANTS.passkeyRegistrationSource.signup,
    getPasskeyRegistrationOutcomeState(outcome),
    'reason' in outcome ? outcome.reason : undefined
  );
};

/**
 * How long the OS passkey prompt was open. Emitted raw so the
 * `dismissed:userCancel` / `dismissed:timeout` threshold can be re-derived from
 * the observed distribution without re-instrumenting.
 */
export const sendPasskeyCeremonyTimingEvent = (
  outcome: TPasskeyRegistrationOutcome,
  elapsedMs: number
): void => {
  sendAuthOperationTimingEvent(
    EVENT_CONSTANTS.context.passkeyCeremony,
    getPasskeyRegistrationOutcomeState(outcome),
    elapsedMs
  );
};

/**
 * Terminal outcomes of the `/v2/signup` bind that follows a created credential.
 * `SignupPreauthCredentialCreated` only reports that WebAuthn returned an
 * attestation, so these are what distinguish a registered passkey from an
 * orphaned account. Every passkey signup emits exactly one of them, so the
 * three states reconcile with no unexplained residual; the failure reason is
 * what separates an orphaned account from an ordinary signup rejection.
 */
export const sendSignupPasskeyBindSuccessEvent = (): void => {
  const { passkeyRegistrationSource, passkeyRegistrationState } = EVENT_CONSTANTS;
  sendPasskeyRegistrationEvent(
    passkeyRegistrationSource.signup,
    passkeyRegistrationState.signupBindSuccess
  );
};

export const sendSignupPasskeyBindFailureEvent = (passkeyFailureReason?: string): void => {
  const { passkeyRegistrationSource, passkeyRegistrationState } = EVENT_CONSTANTS;
  sendPasskeyRegistrationEvent(
    passkeyRegistrationSource.signup,
    passkeyRegistrationState.signupBindFailed,
    passkeyFailureReason
  );
};

/**
 * The OS passkey prompt was raised. Callers must emit this before the ceremony
 * settles, otherwise a user who abandons mid-ceremony emits nothing at all.
 */
export const sendPasskeyOsDialogueShownEvent = (ctx: string, trigger: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authModalShown, ctx, {
    state: EVENT_CONSTANTS.state.passkeyUpselling.passkeyOsDialogue,
    field: trigger
  });
};

/**
 * The signup page was backgrounded before signup completed. Shares the
 * `authClientError` type, so queries counting real client errors must exclude
 * `state LIKE 'abandoned:%'`.
 */
export const sendSignupAbandonmentEvent = (ctx: string, state: string): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authClientError, ctx, { state });
};

const signUpV2ArmOrigin: Record<SignUpV2Treatment, string> = {
  [SignUpV2Treatment.PasswordFirst]: EVENT_CONSTANTS.origin.signUpV2Arm.passwordFirst,
  [SignUpV2Treatment.PasskeyFirst]: EVENT_CONSTANTS.origin.signUpV2Arm.passkeyFirst,
  [SignUpV2Treatment.FoundationControl]: EVENT_CONSTANTS.origin.signUpV2Arm.foundationControl
};

/**
 * The signup form was shown on a treatment arm. `origin` carries the arm so per-arm
 * rates need no join back to IXP enrollment.
 */
export const sendSignUpV2FormPageLoadEvent = (treatment: SignUpV2Treatment): void => {
  sendAuthPageLoadEvent(
    EVENT_CONSTANTS.context.signupForm,
    undefined,
    signUpV2ArmOrigin[treatment]
  );
};

/**
 * Matches Control's `sendSignupButtonClickEvent` shape so the arms are directly
 * comparable, which is why the mode is in `ctype` rather than `state`.
 */
export const sendSignUpV2SubmitEvent = (ctype: string): void => {
  sendAuthButtonClickEvent(
    EVENT_CONSTANTS.btn.signupSubmit,
    '',
    EVENT_CONSTANTS.context.schematizedSignupForm,
    ctype
  );
};

// `origin` is the only thing distinguishing this from the in-card sign-in click, which
// reports the same `btn` and `ctx`.
export const sendSignUpV2ShellSignInEvent = (): void => {
  sendEventWithTraceId(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.schematizedSignupForm,
    {
      btn: EVENT_CONSTANTS.btn.signIn,
      state: '',
      origin: EVENT_CONSTANTS.origin.signUpV2Arm.foundationControl
    }
  );
};

export const sendAddAuthMethodPageReachedEvent = (entryReason: string): void => {
  sendAuthPageLoadEvent(EVENT_CONSTANTS.context.addAuthMethodPage, entryReason);
};

export const sendAuthMethodChosenEvent = (btn: string): void => {
  sendAuthButtonClickEvent(
    btn,
    EVENT_CONSTANTS.state.signUpV2.authMethodChosen,
    EVENT_CONSTANTS.context.addAuthMethodPage
  );
};

export const sendAddAuthMethodBackEvent = (): void => {
  sendAuthButtonClickEvent(EVENT_CONSTANTS.btn.back, '', EVENT_CONSTANTS.context.addAuthMethodPage);
};

/**
 * A `/v2/signup` rejection was surfaced to the user. Separates users who could not
 * complete signup from those who chose not to.
 */
export const sendSignupErrorShownEvent = (
  ctx: string,
  outcome: SignupErrorOutcome,
  errorCode?: number | null
): void => {
  sendAuthMsgShownEvent(
    ctx,
    getSignupErrorField(outcome),
    errorCode === null || errorCode === undefined ? '' : String(errorCode),
    getSignupErrorState(outcome)
  );
};

export default {
  incrementEphemeralCounter,
  sendConversionEvent,
  sendSignupButtonClickEvent,
  sendAppClickEvent,
  incrementSignUpSubmitCounters,
  sendVPCSignupPageLoadEvent,
  sendVPCSignupBirthdateFieldInteractedEvent,
  sendVPCSignupButtonClickedEvent
};
