import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import * as pubSub from "@rbx/www-common/cross-tab-communication/pubsub";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import {
  getTraceIdFromUrl,
  STUDIO_TRACE_ID_PARAM,
} from "@rbx/authentication-common/utils/traceIdUtils";
import type { SsoProvider } from "../types/ssoTypes";
import {
  authFailureReason,
  authMethod,
  type AuthFlowTelemetry,
  type AuthMethod,
} from "../telemetry/authFlowTelemetry";

export const ssoClientErrorReasons = {
  invalidConfig: "invalidConfig",
  popupBlocked: "popupBlocked",
  notApprovedFetchFailed: "notApprovedFetchFailed",
  usernameFetchFailed: "usernameFetchFailed",
  userIdFetchFailed: "userIdFetchFailed",
  callbackFailed: "callbackFailed",
} as const;

export type SsoClientErrorReason =
  (typeof ssoClientErrorReasons)[keyof typeof ssoClientErrorReasons];

export const ssoTelemetryMethods: Readonly<Record<SsoProvider, AuthMethod>> = {
  google: authMethod.ssoGoogle,
  apple: authMethod.ssoApple,
};

export type SsoAttempt = {
  provider: SsoProvider;
  ctx: string;
  startedAt: number;
  /** The starting page's telemetry, so the outcome carries the same flow and variant as the click. */
  telemetry: AuthFlowTelemetry;
};

const SSO_ATTEMPT_STARTED_EVENT = "ssoAttemptStarted";
const SSO_ATTEMPT_SUBSCRIBER_NAMESPACE = "ssoTelemetry";

// Module state is enough: the popup flow keeps this page alive, and a same-window redirect
// leaves it, so there is nothing to resume.
let pendingAttempt: SsoAttempt | undefined;

const sendEventWithTraceId = (
  eventName: string,
  ctx: string,
  props: Record<string, string>,
): void => {
  const traceId = getTraceIdFromUrl();
  eventStreamService.sendEventWithTarget(eventName, ctx, {
    ...props,
    ...(traceId ? { [STUDIO_TRACE_ID_PARAM]: traceId } : {}),
  });
};

/** States share Lua's `externalIdentity.{provider}.{outcome}` shape so platforms query alike. */
const getSsoState = (provider: SsoProvider, outcome: string): string =>
  `externalIdentity.${provider}.${outcome}`;

/**
 * A newer click replaces the pending attempt, since `window.open` reuses the same popup. The
 * completion message reaches every tab, so the start is broadcast and other tabs drop theirs.
 */
export const startSsoAttempt = (
  provider: SsoProvider,
  ctx: string,
  telemetry: AuthFlowTelemetry,
  now: () => number = Date.now,
): void => {
  pendingAttempt = { provider, ctx, startedAt: now(), telemetry };
  try {
    pubSub.publish(SSO_ATTEMPT_STARTED_EVENT, String(pendingAttempt.startedAt));
  } catch {
    // Storage is blocked, so no other tab can hear the completion either.
  }
};

/** Drops this tab's pending attempt when another tab starts one. Returns the unsubscribe. */
export const watchOtherTabSsoAttempts = (): (() => void) => {
  // publish() removes the key before setting it, so other tabs also see a null payload.
  pubSub.subscribe(SSO_ATTEMPT_STARTED_EVENT, SSO_ATTEMPT_SUBSCRIBER_NAMESPACE, newValue => {
    if (newValue != null) {
      pendingAttempt = undefined;
    }
  });
  return () => pubSub.unsubscribe(SSO_ATTEMPT_STARTED_EVENT, SSO_ATTEMPT_SUBSCRIBER_NAMESPACE);
};

/**
 * A popup the user closes, and an init failure, send nothing back, so those attempts stay pending
 * and are never timed.
 */
const endSsoAttempt = (
  outcome: "success" | "failed",
  now: () => number,
): SsoAttempt | undefined => {
  const attempt = pendingAttempt;
  pendingAttempt = undefined;
  if (attempt) {
    sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authOperationTiming, attempt.ctx, {
      state: getSsoState(attempt.provider, outcome),
      elapsedTime: Math.round(now() - attempt.startedAt).toString(),
    });
    const method = ssoTelemetryMethods[attempt.provider];
    if (outcome === "success") {
      attempt.telemetry.requestSucceeded(method);
    } else {
      attempt.telemetry.requestFailed(method, authFailureReason.ssoCallback);
    }
  }
  return attempt;
};

export const completeSsoAttempt = (now: () => number = Date.now): SsoAttempt | undefined =>
  endSsoAttempt("success", now);

export const sendSsoClientErrorEvent = (
  ctx: string,
  provider: SsoProvider,
  reason: SsoClientErrorReason,
): void => {
  sendEventWithTraceId(EVENT_CONSTANTS.schematizedEventTypes.authClientError, ctx, {
    state: getSsoState(provider, reason),
  });
};

/** The callback failed, including a cancel at the provider, and sent the popup to its error page. */
export const failSsoAttempt = (now: () => number = Date.now): void => {
  const attempt = endSsoAttempt("failed", now);
  if (attempt) {
    sendSsoClientErrorEvent(attempt.ctx, attempt.provider, ssoClientErrorReasons.callbackFailed);
  }
};
