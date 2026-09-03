import * as http from "@rbx/core-scripts/http";
import {
  convertPublicKeyParametersToStandardBase64,
  formatCredentialRequestWeb,
  formatCredentialRegistrationResponseWeb,
} from "@rbx/core-scripts/auth/fido2";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  getSilentUpgradeAvailableUrl,
  getPasskeyStartRegistrationUrl,
  getPasskeyFinishRegistrationUrl,
} from "../constants/urlConstants";
import {
  sendAuthPageLoadEvent,
  sendPasskeyCreationSourceEvent,
  sendPasskeyRegistrationEvent,
} from "../services/eventService";
import EVENT_CONSTANTS from "../constants/eventsConstants";
import { trackCounter, trackError, publishMetric } from "../observability";
import {
  getBrowserInfo,
  getCredentialCreateBrowserDims,
  type BrowserFamily,
} from "../observability/browserInfo";

const upgradeState = EVENT_CONSTANTS.passkeyUpgradeState;

const PASSKEY_UPGRADE_SESSION_KEY = "RBXPasskeyUpgradePending";
const PASSKEY_UPGRADE_USER_ID_KEY = "RBXPasskeyUpgradeUserId";
const PASSKEY_DELAY_UNTIL_KEY = "RBXPasskeyUpgradeDelayUntil";
const DELAYED_UPGRADE_MS = 8_000;

const UPGRADE_BROWSER_FAMILIES = new Set<BrowserFamily>(["Chrome", "Safari"]);

/** Returns the authenticated userId, or null if the session isn't authenticated. */
const getCurrentUserId = (): string | null => {
  const user = authenticatedUser();
  if (user?.id == null) return null;
  return String(user.id);
};

const FLAG_TO_CTX: Record<string, string> = {
  ImmediateLogin: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginImmediate,
  DelayedLogin: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginDelayed,
  DelayedSignup: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignupDelayed,
};

// Maps the internal event-context value to the `source` enum the
// finishRegistration API expects on its request body.
const CTX_TO_SOURCE: Record<string, string> = {
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginImmediate]:
    "PasskeySilentUpgradeLoginImmediate",
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginDelayed]: "PasskeySilentUpgradeLoginDelayed",
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignupDelayed]:
    "PasskeySilentUpgradeSignupDelayed",
};

type UpgradeSource = "LoginImmediate" | "LoginDelayed" | "SignupDelayed" | "Unknown";

const CTX_TO_UPGRADE_SOURCE: Record<string, UpgradeSource> = {
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginImmediate]: "LoginImmediate",
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginDelayed]: "LoginDelayed",
  [EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignupDelayed]: "SignupDelayed",
};

const ctxToUpgradeSource = (ctx: string): UpgradeSource => CTX_TO_UPGRADE_SOURCE[ctx] ?? "Unknown";

const trackApiCall = (name: string, statusCode: string): void => {
  publishMetric(`${name}_API`, { statusCode: "Throughput" });
  publishMetric(`${name}_API`, { statusCode });
};

const isDelayedCtx = (ctx: string): boolean =>
  ctx === EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginDelayed ||
  ctx === EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignupDelayed;

type UpgradeIntent = { ctx: string; delayMs: number; expectedUserId: string | null };

/**
 * Reads the session-storage upgrade flag and computes remaining delay.
 * Immediate upgrades consume the flag on read. Delayed upgrades persist a
 * `delayUntil` timestamp so the countdown survives page navigations.
 */
const readUpgradeIntent = (): UpgradeIntent | null => {
  try {
    const flag = sessionStorage.getItem(PASSKEY_UPGRADE_SESSION_KEY);
    const ctx = flag ? FLAG_TO_CTX[flag] : undefined;
    if (!ctx) {
      if (flag) {
        sessionStorage.removeItem(PASSKEY_UPGRADE_SESSION_KEY);
        trackCounter("UpgradeFlagInvalid", { reason: "UnknownFlagValue" });
      }
      return null;
    }

    const expectedUserId = sessionStorage.getItem(PASSKEY_UPGRADE_USER_ID_KEY) ?? null;

    if (!isDelayedCtx(ctx)) {
      sessionStorage.removeItem(PASSKEY_UPGRADE_SESSION_KEY);
      return { ctx, delayMs: 0, expectedUserId };
    }

    let delayUntil = Number(sessionStorage.getItem(PASSKEY_DELAY_UNTIL_KEY));
    if (!delayUntil) {
      delayUntil = Date.now() + DELAYED_UPGRADE_MS;
      sessionStorage.setItem(PASSKEY_DELAY_UNTIL_KEY, String(delayUntil));
    }
    return { ctx, delayMs: Math.max(0, delayUntil - Date.now()), expectedUserId };
  } catch {
    sendAuthPageLoadEvent(
      EVENT_CONSTANTS.context.silentPasskeyUpgrade,
      upgradeState.consumePasskeySessionFlagError,
    );
    trackCounter("UpgradeFlagInvalid", { reason: "StorageReadError" });
  }
  return null;
};

const clearUpgradeFlags = (): void => {
  sessionStorage.removeItem(PASSKEY_UPGRADE_SESSION_KEY);
  sessionStorage.removeItem(PASSKEY_UPGRADE_USER_ID_KEY);
  sessionStorage.removeItem(PASSKEY_DELAY_UNTIL_KEY);
};

/**
 * Returns `true` when the active userId matches the one captured at flag-set
 * time; otherwise clears flags, emits a cause-specific telemetry state, and
 * returns `false`.
 */
const verifyUpgradeUserOrAbort = (
  ctx: string,
  expectedUserId: string | null,
  source: UpgradeSource,
): boolean => {
  const currentUserId = getCurrentUserId();
  if (expectedUserId === null) {
    clearUpgradeFlags();
    sendAuthPageLoadEvent(ctx, upgradeState.expectedUserIdMissing);
    trackCounter("UpgradeAborted", { source, reason: "ExpectedUserIdMissing" });
    return false;
  }
  if (currentUserId === null) {
    clearUpgradeFlags();
    sendAuthPageLoadEvent(ctx, upgradeState.currentUserIdMissing);
    trackCounter("UpgradeAborted", { source, reason: "CurrentUserIdMissing" });
    return false;
  }
  if (currentUserId !== expectedUserId) {
    clearUpgradeFlags();
    sendAuthPageLoadEvent(ctx, upgradeState.userIdMismatch);
    trackCounter("UpgradeAborted", { source, reason: "UserIdMismatch" });
    return false;
  }
  return true;
};

type StartRegistrationResponse = {
  creationOptions: string;
  sessionId: string;
};

const EXPECTED_CREATE_ERRORS = new Set([
  "AbortError",
  "NotAllowedError",
  "InvalidStateError",
  "ConstraintError",
]);

// Passkey nickname is generated by security-key-service, keeping a default value.
type SilentUpgradeEligibilityResponse = {
  suEligibility: boolean;
};

const CREDENTIAL_NICKNAME = "Passkey";

const getHttpErrorStatus = (err: unknown, ctx: string): string => {
  try {
    if (err != null && typeof err === "object") {
      // core-scripts rejects with the bare response (top-level `status`), or the
      // full AxiosError (`response.status`) when `fullError` is set. Check both.
      const { status, response } = err as {
        status?: number;
        response?: { status?: number };
      };
      const resolvedStatus = status ?? response?.status;
      if (typeof resolvedStatus === "number") {
        return String(resolvedStatus);
      }
    }
  } catch {
    sendAuthPageLoadEvent(ctx, upgradeState.httpStatusErrorParsing);
  }
  return "Unknown";
};

const checkSilentUpgradeAvailable = async (
  ctx: string,
  source: UpgradeSource,
): Promise<boolean> => {
  try {
    const { data } = await http.get<SilentUpgradeEligibilityResponse>({
      url: getSilentUpgradeAvailableUrl(),
      withCredentials: true,
    });
    trackApiCall("SilentUpgradeEligibility", "200");
    if (!data.suEligibility) {
      trackCounter("UpgradeIneligible", { source });
      return false;
    }
    trackCounter("EligibilityPassed", { source });
    return true;
  } catch (e) {
    const statusCode = getHttpErrorStatus(e, ctx);
    trackApiCall("SilentUpgradeEligibility", statusCode);
    sendAuthPageLoadEvent(ctx, `${upgradeState.silentUpgradeCheckError}_${statusCode}`);
    trackError(
      "UpgradeFailed",
      {
        source,
        browserFamily: getBrowserInfo().browserFamily,
        stage: "Eligibility",
        reason: statusCode,
      },
      e,
    );
    return false;
  }
};

const startRegistration = async (): Promise<StartRegistrationResponse> => {
  const { data } = await http.post<StartRegistrationResponse>(
    {
      url: getPasskeyStartRegistrationUrl(),
      withCredentials: true,
    },
    { isSilentUpgrade: true },
  );
  return data;
};

const finishRegistration = async (
  sessionId: string,
  credentialNickname: string,
  attestationResponse: string,
  source: string,
): Promise<void> => {
  await http.post(
    {
      url: getPasskeyFinishRegistrationUrl(),
      withCredentials: true,
    },
    { sessionId, credentialNickname, attestationResponse, source },
  );
};

/**
 * Silently upgrades the user to a passkey by: (1) requesting registration
 * options from the server, (2) calling `navigator.credentials.create` with
 * `mediation: "conditional"` so the browser creates a platform credential
 * without an explicit user prompt, and (3) sending the attestation response
 * back to the server to finalize registration.
 *
 * Returns `true` if the upgrade succeeded, `false` otherwise.
 * Never throws — all failures are handled internally with telemetry.
 */
export const attemptPasskeyUpgrade = async (): Promise<boolean> => {
  const intent = readUpgradeIntent();
  if (intent === null) {
    return false;
  }

  const { ctx, delayMs, expectedUserId } = intent;
  const source = ctxToUpgradeSource(ctx);
  trackCounter("UpgradeFlagObserved", { source });

  const { browserFamily } = getBrowserInfo();
  if (!UPGRADE_BROWSER_FAMILIES.has(browserFamily)) {
    clearUpgradeFlags();
    sendAuthPageLoadEvent(ctx, upgradeState.filteredByUnsupportedBrowser);
    trackCounter("UpgradeFilteredByBrowser", { source, browserFamily });
    return false;
  }

  // Abort if the active account differs from the one that set the flag.
  if (!verifyUpgradeUserOrAbort(ctx, expectedUserId, source)) {
    return false;
  }

  if (delayMs > 0) {
    await new Promise<void>(resolve => {
      setTimeout(resolve, delayMs);
    });

    // Re-check because the session may have changed during the delay
    // (e.g. switched accounts).
    if (!verifyUpgradeUserOrAbort(ctx, expectedUserId, source)) {
      return false;
    }
  }

  clearUpgradeFlags();

  const upgradeAvailable = await checkSilentUpgradeAvailable(ctx, source);
  if (!upgradeAvailable) {
    sendAuthPageLoadEvent(ctx, upgradeState.silentUpgradeNotEligible);
    return false;
  }

  let start: StartRegistrationResponse;
  try {
    start = await startRegistration();
    trackApiCall("StartRegistration", "200");
    sendAuthPageLoadEvent(ctx, upgradeState.startRegistrationSuccess);
    trackCounter("StartRegistrationSucceeded", { source });
  } catch (e) {
    const statusCode = getHttpErrorStatus(e, ctx);
    trackApiCall("StartRegistration", statusCode);
    sendAuthPageLoadEvent(ctx, `${upgradeState.startRegistrationError}_${statusCode}`);
    trackError(
      "UpgradeFailed",
      {
        source,
        browserFamily: getBrowserInfo().browserFamily,
        stage: "StartRegistration",
        reason: statusCode,
      },
      e,
    );
    return false;
  }

  const makeCredentialOptions = convertPublicKeyParametersToStandardBase64(start.creationOptions);
  const publicKey = formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions));

  trackCounter("CredentialCreateAttempt", { source, ...getCredentialCreateBrowserDims() });

  let credential: PublicKeyCredential;
  try {
    const createOptions: CredentialCreationOptions & { mediation: CredentialMediationRequirement } =
      { publicKey, mediation: "conditional" };
    const result = await navigator.credentials.create(createOptions);
    if (result === null) {
      sendAuthPageLoadEvent(ctx, upgradeState.createCredentialError);
      trackError("CredentialCreateFailed", {
        source,
        ...getCredentialCreateBrowserDims(),
        reason: "NullCredential",
      });
      return false;
    }
    credential = result as PublicKeyCredential;
    trackCounter("CredentialCreated", { source, ...getCredentialCreateBrowserDims() });
  } catch (e) {
    const name = e instanceof DOMException ? e.name : undefined;

    if (name === "InvalidStateError" && (publicKey.excludeCredentials?.length ?? 0) > 0) {
      sendAuthPageLoadEvent(ctx, upgradeState.invalidStateErrorHasExistingPasskey);
      trackCounter("AlreadyHasPasskey", { source, ...getCredentialCreateBrowserDims() });
      return false;
    }

    if (name && EXPECTED_CREATE_ERRORS.has(name)) {
      sendAuthPageLoadEvent(ctx, name);
      trackCounter("CredentialCreateExpectedRejection", {
        source,
        ...getCredentialCreateBrowserDims(),
        reason: name,
      });
      return false;
    }

    sendAuthPageLoadEvent(ctx, upgradeState.unknownError);

    const message = e instanceof Error ? e.message : String(e);
    const failureReason = name ? `${name}: ${message}` : message;
    sendPasskeyRegistrationEvent(
      CTX_TO_SOURCE[ctx] ?? ctx,
      EVENT_CONSTANTS.passkeyRegistrationState.navigationCredentialCreateFailure,
      failureReason,
    );
    trackError(
      "CredentialCreateFailed",
      { source, ...getCredentialCreateBrowserDims(), reason: name ?? "UnknownError" },
      e,
    );
    return false;
  }

  const attestationResponse = formatCredentialRegistrationResponseWeb(credential);

  try {
    const finishSource = CTX_TO_SOURCE[ctx] ?? ctx;
    await finishRegistration(
      start.sessionId,
      CREDENTIAL_NICKNAME,
      attestationResponse,
      finishSource,
    );
    trackApiCall("FinishRegistration", "200");
    sendAuthPageLoadEvent(ctx, upgradeState.finishRegistrationSuccess);
    sendPasskeyCreationSourceEvent(ctx);
    trackCounter("UpgradeSucceeded", { source, browserFamily: getBrowserInfo().browserFamily });
    return true;
  } catch (e) {
    const statusCode = getHttpErrorStatus(e, ctx);
    trackApiCall("FinishRegistration", statusCode);
    sendAuthPageLoadEvent(ctx, `${upgradeState.finishRegistrationError}_${statusCode}`);
    trackError(
      "UpgradeFailed",
      {
        source,
        browserFamily: getBrowserInfo().browserFamily,
        stage: "FinishRegistration",
        reason: statusCode,
      },
      e,
    );
    return false;
  }
};
