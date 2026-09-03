import { eventStreamService } from "core-roblox-utilities";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { LogoutUpsellScreen, LogoutUpsellScreenName } from "../constants/logoutUpsellScreens";

/**
 * Telemetry for the logout-upsell flow.
 *
 * Events use the shared schematized auth event types (`authModalShown`,
 * `authButtonClick`, `authFormInteraction`, `authClientError`) so they land in
 * the same warehouse tables as the rest of auth (`accountauth_auth_*`). All
 * events share the `logoutUpsell` context; the `field`/`state`/`btn` values
 * below identify the specific screen and action.
 *
 * Keep these string values stable: they show up as enum-like values on
 * dashboards and changing them silently breaks alerting and funnel queries.
 */

const { schematizedEventTypes, aType } = AUTH_EVENT_CONSTANTS;

const LOGOUT_UPSELL_CONTEXT = "logoutUpsell";

/** How the user arrived on the add-email screen. */
export const AddEmailOrigin = {
  /** Tapped "Add email" on the passkey upsell. */
  Passkey: "passkey",
  /** Tapped "Change email" on the verify-email screen. */
  ChangeEmail: "changeEmail",
} as const;

export type AddEmailOriginName = (typeof AddEmailOrigin)[keyof typeof AddEmailOrigin];

const Field = {
  email: "email",
} as const;

const Btn = {
  addPasskey: "addPasskey",
  addEmail: "addEmail",
  signOut: "signOut",
  dismiss: "dismiss",
  continue: "continue",
  resend: "resend",
  changeEmail: "changeEmail",
} as const;

const send = (
  eventName: string,
  params: Record<string, string | number | boolean | undefined>,
  context: string = LOGOUT_UPSELL_CONTEXT,
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- untyped legacy module
    eventStreamService.sendEventWithTarget(eventName, context, params);
  } catch {
    // Telemetry is best-effort: never let an event-stream failure break logout.
  }
};

export const LogoutUpsellClientError = {
  /** Caller tried to open the new prompts-service-gated modal entrypoint, but
   *  the legacy bundle in this page session didn't expose it. Almost always
   *  a rolling-deploy / cached-bundle skew. */
  LegacyModalEntrypointMissing: "legacyModalEntrypointMissing",
  /** The new entrypoint threw or rejected before dispatching the modal event
   *  (e.g. `getSettingsUIPolicy()` blew up). We failed open to a direct
   *  logout, so the user did not get the upsell. */
  LegacyModalOpenFailed: "legacyModalOpenFailed",
} as const;

export type LogoutUpsellClientErrorState =
  (typeof LogoutUpsellClientError)[keyof typeof LogoutUpsellClientError];

export const sendLogoutUpsellClientError = (state: LogoutUpsellClientErrorState): void => {
  send(schematizedEventTypes.authClientError, { state });
};

// --- Passkey upsell screen ---------------------------------------------------

export const sendPasskeyUpsellShown = (): void => {
  send(schematizedEventTypes.authModalShown, { field: LogoutUpsellScreen.PasskeyUpsell });
};

export const sendAddPasskeyClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.addPasskey,
    state: LogoutUpsellScreen.PasskeyUpsell,
  });
};

export const sendAddEmailClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.addEmail,
    state: LogoutUpsellScreen.PasskeyUpsell,
  });
};

export const sendSignOutClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.signOut,
    state: LogoutUpsellScreen.PasskeyUpsell,
  });
};

// --- Passkey registration ceremony -------------------------------------------

const PASSKEY_REGISTRATION_FIELD = "passkeyRegistration";

/**
 * Progress markers for one `registerPasskey` attempt, emitted in order. The
 * trail is what separates refusal from breakage: browsers report dismissal,
 * timeout, and several genuine failures as the same `NotAllowedError`, so a
 * click with no `DialogInvoked` is the only proof the fault was ours.
 */
export const PasskeyRegistrationStage = {
  StartRequested: "startRequested",
  DialogInvoked: "dialogInvoked",
  DialogResolved: "dialogResolved",
  DialogRejected: "dialogRejected",
  FinishRequested: "finishRequested",
  Registered: "registered",
} as const;

export type PasskeyRegistrationStageName =
  (typeof PasskeyRegistrationStage)[keyof typeof PasskeyRegistrationStage];

/** Only the stages that terminate the OS prompt have a duration to report. */
export type PasskeyPromptTimingState =
  | typeof PasskeyRegistrationStage.DialogResolved
  | typeof PasskeyRegistrationStage.DialogRejected;

/**
 * Failing step, carried in `origin`. Values match the settings passkey flow so
 * both surfaces can be compared in one query.
 */
export const PasskeyRegistrationErrorOrigin = {
  CompatibilityCheck: "compatibilityCheck",
  StartRegistration: "startRegistration",
  RegisterCredentialsErrorCode: "registerCredentialsErrorCode",
  RegisterCredentialsEmptyResponse: "registerCredentialsEmptyResponse",
  FinishRegistration: "finishRegistration",
  Unexpected: "unexpected",
} as const;

export type PasskeyRegistrationErrorOriginName =
  (typeof PasskeyRegistrationErrorOrigin)[keyof typeof PasskeyRegistrationErrorOrigin];

export const sendPasskeyRegistrationStage = (stage: PasskeyRegistrationStageName): void => {
  send(schematizedEventTypes.authFormInteraction, {
    field: PASSKEY_REGISTRATION_FIELD,
    state: stage,
  });
};

/**
 * `state` must stay low-cardinality: pass a DOMException `name` or error code,
 * never a raw `message`.
 */
export const sendPasskeyRegistrationError = (
  origin: PasskeyRegistrationErrorOriginName,
  state: string,
): void => {
  send(schematizedEventTypes.authClientError, { origin, state });
};

/**
 * Time the user spent in the OS prompt, which separates an instant programmatic
 * failure from a human dismissal.
 *
 * This rides on `authOperationTiming` because that is the only auth event with a
 * numeric field (`elapsedTime`); `authFormInteraction` and `authClientError` are
 * all-string, so a duration passed to either would be dropped at ingest. `ctx`
 * stays `logoutUpsell`, so `state` alone distinguishes the outcome.
 */
export const sendPasskeyPromptTiming = (
  state: PasskeyPromptTimingState,
  elapsedTime: number,
): void => {
  send(schematizedEventTypes.authOperationTiming, { elapsedTime, state });
};

// --- Add email screen --------------------------------------------------------

export const sendAddEmailShown = (origin: AddEmailOriginName): void => {
  send(schematizedEventTypes.authModalShown, { field: LogoutUpsellScreen.AddEmail, origin });
};

export const sendEmailFieldInteraction = (origin: AddEmailOriginName): void => {
  send(schematizedEventTypes.authFormInteraction, {
    field: Field.email,
    state: aType.focus,
    origin,
  });
};

export const sendAddEmailContinueClick = (origin: AddEmailOriginName): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.continue,
    state: LogoutUpsellScreen.AddEmail,
    origin,
  });
};

/** Add-email failures other than a server rejection. */
export const AddEmailError = {
  /** Never reached the server. */
  InvalidFormat: "invalidFormat",
  /** `submitEmailAddress` threw, which it is documented not to do. */
  Threw: "threw",
} as const;

export type AddEmailErrorState =
  | (typeof AddEmailError)[keyof typeof AddEmailError]
  | `code${number}`
  | "codeUnknown";

/** Raw `EmailErrors` code, so no local name mapping can drift out of date. */
export const addEmailServerError = (errorCode: number | null): AddEmailErrorState =>
  errorCode == null ? "codeUnknown" : `code${errorCode}`;

/** `origin` stays keyed to arrival like the screen's other events, so the reason goes in `state`. */
export const sendAddEmailError = (origin: AddEmailOriginName, state: AddEmailErrorState): void => {
  send(schematizedEventTypes.authClientError, { origin, state });
};

// --- Verify email screen -----------------------------------------------------

export const sendVerifyEmailShown = (): void => {
  send(schematizedEventTypes.authModalShown, { field: LogoutUpsellScreen.VerifyEmail });
};

export const sendResendClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.resend,
    state: LogoutUpsellScreen.VerifyEmail,
  });
};

export const sendContinueToSignOutClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.signOut,
    state: LogoutUpsellScreen.VerifyEmail,
  });
};

export const sendChangeEmailClick = (): void => {
  send(schematizedEventTypes.authButtonClick, {
    btn: Btn.changeEmail,
    state: LogoutUpsellScreen.VerifyEmail,
  });
};

// --- Dismiss (X / Escape), shared across screens -----------------------------

export const sendDismissClick = (screen: LogoutUpsellScreenName): void => {
  send(schematizedEventTypes.authButtonClick, { btn: Btn.dismiss, state: screen });
};
