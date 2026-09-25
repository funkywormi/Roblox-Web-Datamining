import { AccountIntegrityChallengeService, AccountSwitcherService } from "Roblox";
import { buildAuthParamsWithSecureAuthIntentAndClientKeyPair } from "@rbx/authentication-common/hardwareBackedAuth/utils/requestUtils";
import { SilentPasskeyUpgradeVariant } from "../../shared/silentPasskeyUpgradeCore";
import { TSignupParams, TSignupResponse } from "@rbx/authentication-common/types/signupTypes";
import { counters } from "../constants/signupConstants";
import {
  incrementEphemeralCounter,
  sendSignupPasskeyBindFailureEvent,
  sendSignupPasskeyBindSuccessEvent,
} from "./eventService";
import { signup } from "./signupService";
import { handlePostSignup } from "../utils/signupUtils";
import { getPasskeyBindFailureReason } from "../utils/passkeySignupErrorUtils";
import { attemptSetPasskeyUpgradeFlag } from "../utils/signupPasskeyUpgrade";
import { classifySignupError } from "../utils/signupErrorUtils";
import {
  authFailureReason,
  authMethod,
  AuthFailureReason,
  AuthFlowTelemetry,
} from "../../shared/telemetry/authFlowTelemetry";

export type SubmitSignupOptions = {
  params: TSignupParams;
  returnUrl: string;
  isVerifiedParentConsentSignup: boolean;
  isVietnamSignup: boolean;
  isConditionalCreateSupported: boolean;
  silentPasskeyUpgradeBrowserCheck: SilentPasskeyUpgradeVariant;
  telemetry?: AuthFlowTelemetry;
};

export type SignupRequestResult = {
  result: TSignupResponse;
  usedSecureAuthenticationIntent: boolean;
};

export type CompleteSignupSuccessOptions = Omit<SubmitSignupOptions, "params" | "telemetry"> &
  SignupRequestResult;

const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const record = error as {
    status?: unknown;
    response?: { status?: unknown };
  };
  if (typeof record.response?.status === "number") {
    return record.response.status;
  }
  return typeof record.status === "number" ? record.status : undefined;
};

export const getSignupTelemetryFailureReason = (error: unknown): AuthFailureReason => {
  if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
    return authFailureReason.challenge;
  }
  const outcome = classifySignupError(error, () => false);
  switch (outcome.type) {
    case "captcha":
      return authFailureReason.captcha;
    case "field":
      return authFailureReason.credentials;
    case "identityVerification":
    case "abandonedChallenge":
      return authFailureReason.challenge;
    case "accountSwitcher":
    case "ageRestriction":
      return authFailureReason.accountRestriction;
    case "passkeyRegistrationFailed":
      return authFailureReason.passkeyBind;
    case "general":
      return authFailureReason.server;
    case "unknown": {
      if (outcome.isTooManyAttempts) {
        return authFailureReason.rateLimited;
      }
      const status = getHttpStatus(error);
      if (status === 429) {
        return authFailureReason.rateLimited;
      }
      if (status !== undefined && status >= 500) {
        return authFailureReason.server;
      }
      return error === undefined || error instanceof Error
        ? authFailureReason.network
        : authFailureReason.unknown;
    }
    default:
      return authFailureReason.unknown;
  }
};

/**
 * Adds secure-authentication request data and calls `/v2/signup`. Errors
 * propagate so the calling surface can classify them before any success-side
 * effects or navigation run.
 */
export const executeSignupRequest = async (params: TSignupParams): Promise<SignupRequestResult> => {
  const { authParams } = await buildAuthParamsWithSecureAuthIntentAndClientKeyPair(params);
  const result = await signup(authParams);

  return {
    result,
    usedSecureAuthenticationIntent: Boolean(authParams.secureAuthenticationIntent),
  };
};

/**
 * Applies the production success-side effects after a successful signup
 * request. Keeping this separate lets another signup surface inspect the
 * request outcome before choosing its completion behavior.
 */
export const completeSignupSuccess = async ({
  result,
  usedSecureAuthenticationIntent,
  returnUrl,
  isVerifiedParentConsentSignup,
  isVietnamSignup,
  isConditionalCreateSupported,
  silentPasskeyUpgradeBrowserCheck,
}: CompleteSignupSuccessOptions): Promise<void> => {
  if (usedSecureAuthenticationIntent) {
    incrementEphemeralCounter(counters.successWithSAI);
  }
  if (isVietnamSignup) {
    incrementEphemeralCounter(counters.successWithVNG);
  }

  AccountSwitcherService?.storeAccountSwitcherBlob(result.accountBlob ?? "");

  if (isVerifiedParentConsentSignup) {
    await handlePostSignup(result.returnUrl ?? "");
    return;
  }

  attemptSetPasskeyUpgradeFlag({
    isConditionalCreateSupported,
    silentUpgradeBrowserCheck: silentPasskeyUpgradeBrowserCheck,
    userId: result.userId.toString(),
  });
  await handlePostSignup(returnUrl, result.userId.toString());
};

/**
 * Executes the production signup request and its success-side effects.
 *
 * Bind telemetry is emitted here rather than by the calling surface because
 * `completeSignupSuccess` navigates away; anything emitted after it awaits may
 * not survive the page unload. Every terminal rejection is reported, including
 * ones the client cannot attribute, so the bind events stay reconcilable
 * against `SignupPreauthCredentialCreated`.
 */
export const submitSignup = async ({
  params,
  telemetry,
  ...completionOptions
}: SubmitSignupOptions): Promise<void> => {
  const isPasskeySignup = Boolean(params.passkeySessionId);
  const method = isPasskeySignup ? authMethod.passkey : authMethod.password;
  let requestResult: SignupRequestResult;
  telemetry?.requestStarted(method);
  try {
    requestResult = await executeSignupRequest(params);
  } catch (error) {
    telemetry?.requestFailed(method, getSignupTelemetryFailureReason(error));
    const failureReason = isPasskeySignup ? getPasskeyBindFailureReason(error) : null;
    if (failureReason) {
      sendSignupPasskeyBindFailureEvent(failureReason);
    }
    throw error;
  }

  if (isPasskeySignup) {
    sendSignupPasskeyBindSuccessEvent();
  }
  telemetry?.requestSucceeded(method);
  telemetry?.flowCompleted(method);

  await completeSignupSuccess({
    ...completionOptions,
    ...requestResult,
  });
};
