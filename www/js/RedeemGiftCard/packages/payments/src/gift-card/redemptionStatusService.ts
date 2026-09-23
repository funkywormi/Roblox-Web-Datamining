import { EnvironmentUrls } from "@rbx/environment-urls";
import type { RedemptionResult } from "@rbx/payments/types";
import {
  REDEMPTION_STATUS_REQUEST_TIMEOUT_MS,
  REDEMPTION_STATUS_POLL_TIMEOUT_MS,
  REDEMPTION_STATUS_POLL_INTERVAL_MS,
  REDEMPTION_POLL_OUTCOMES,
  REDEMPTION_STATUS_FAILURE_REASONS,
} from "./redemptionStatusConstants";
import { ErrorUtils } from "../creditCheckout/utils/errorUtils";
import { trackCounter, trackError, withApiEventsV2 } from "../creditCheckout/observability";

const REDEMPTION_STATES = ["InProgress", "Succeeded", "Failed"] as const;

export type RedemptionState = (typeof REDEMPTION_STATES)[number];

export const TERMINAL_REDEMPTION_STATES: readonly RedemptionState[] = ["Succeeded", "Failed"];

export type RedemptionStatusResponse = {
  /** Null with error code 170 means another user owns the redemption; stop polling. */
  state: RedemptionState | null;
  errorCode?: number;
  result: RedemptionResult;
};

export type RedemptionStatusFailureReason =
  (typeof REDEMPTION_STATUS_FAILURE_REASONS)[keyof typeof REDEMPTION_STATUS_FAILURE_REASONS];

export type RedemptionStatusFailure = {
  reason: RedemptionStatusFailureReason;
  statusCode?: number;
  error?: unknown;
};

export type RedemptionStatusResult =
  | { ok: true; response: RedemptionStatusResponse }
  | ({ ok: false } & RedemptionStatusFailure);

// Transient failures have a separate retry cap, but still consume the overall time budget.
export const MAX_CONSECUTIVE_TRANSIENT_FAILURES = 3;

// Transient responses may return immediately; avoid a tight retry loop.
export const TRANSIENT_RETRY_DELAY_MS = 250;

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const isTerminalRedemptionState = (state: RedemptionState | null): boolean =>
  state === null || TERMINAL_REDEMPTION_STATES.includes(state);

export const getRedemptionStatus = async (
  workflowId: string,
  timeoutMs = REDEMPTION_STATUS_REQUEST_TIMEOUT_MS,
): Promise<RedemptionStatusResult> => {
  try {
    const { data } = await withApiEventsV2<RedemptionStatusResponse>({
      method: "GET",
      url: `${EnvironmentUrls.apiGatewayUrl}/gift-card/v1/redemption-status?key=${encodeURIComponent(workflowId)}`,
      config: {
        withCredentials: true,
        // Preserve Axios errors; otherwise the interceptor rejects timeouts with undefined.
        fullError: true,
        timeout: timeoutMs,
      },
      eventCounterProps: { call: "GetRedemptionStatus" },
    });

    // Treat empty responses (including 204) as transient.
    if (!data) {
      return { ok: false, reason: REDEMPTION_STATUS_FAILURE_REASONS.Transient };
    }

    return { ok: true, response: data };
  } catch (err) {
    const statusCode = ErrorUtils.extractStatusCode(err);

    return {
      ok: false,
      reason:
        statusCode === 400
          ? REDEMPTION_STATUS_FAILURE_REASONS.BadRequest
          : statusCode === 429
            ? REDEMPTION_STATUS_FAILURE_REASONS.Throttled
            : REDEMPTION_STATUS_FAILURE_REASONS.Transient,
      statusCode,
      error: err,
    };
  }
};

export type RedemptionPollResult =
  | ({ outcome: typeof REDEMPTION_POLL_OUTCOMES.Failed } & RedemptionStatusFailure)
  | {
      outcome: typeof REDEMPTION_POLL_OUTCOMES.Terminal;
      response: RedemptionStatusResponse;
      polls: number;
    }
  | {
      outcome: typeof REDEMPTION_POLL_OUTCOMES.Exhausted;
      polls: number;
    }
  | {
      outcome: typeof REDEMPTION_POLL_OUTCOMES.Cancelled;
    };

export const pollRedemptionStatus = async ({
  workflowId,
  isCancelled,
}: {
  workflowId: string;
  isCancelled?: () => boolean;
}): Promise<RedemptionPollResult> => {
  trackCounter("GiftCard_RedeemPollStarted");

  let polls = 0;
  let consecutiveTransientFailures = 0;
  const deadline = Date.now() + REDEMPTION_STATUS_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (isCancelled?.()) {
      return { outcome: REDEMPTION_POLL_OUTCOMES.Cancelled };
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    const result = await getRedemptionStatus(
      workflowId,
      Math.min(REDEMPTION_STATUS_REQUEST_TIMEOUT_MS, remainingMs),
    );

    if (isCancelled?.()) {
      return { outcome: REDEMPTION_POLL_OUTCOMES.Cancelled };
    }

    if (!result.ok) {
      if (result.reason !== REDEMPTION_STATUS_FAILURE_REASONS.Transient) {
        trackError("Error_GiftCard_RedeemPollFailed", { reason: result.reason }, result.error);
        return {
          outcome: REDEMPTION_POLL_OUTCOMES.Failed,
          reason: result.reason,
          statusCode: result.statusCode,
          error: result.error,
        };
      }
      const retryRemainingMs = deadline - Date.now();
      if (retryRemainingMs <= 0) {
        break;
      }
      consecutiveTransientFailures += 1;
      if (consecutiveTransientFailures >= MAX_CONSECUTIVE_TRANSIENT_FAILURES) {
        trackError("Error_GiftCard_RedeemPollFailed", { reason: result.reason }, result.error);
        return {
          outcome: REDEMPTION_POLL_OUTCOMES.Failed,
          reason: result.reason,
          statusCode: result.statusCode,
          error: result.error,
        };
      }
      // eslint-disable-next-line no-await-in-loop
      await delay(Math.min(TRANSIENT_RETRY_DELAY_MS, retryRemainingMs));
      // eslint-disable-next-line no-continue
      continue;
    }

    const { response } = result;
    consecutiveTransientFailures = 0;
    polls += 1;

    if (isTerminalRedemptionState(response.state)) {
      trackCounter("GiftCard_RedeemPollResolved", {
        state: response.state ?? "Unowned",
        polls: String(polls),
      });
      return { outcome: REDEMPTION_POLL_OUTCOMES.Terminal, response, polls };
    }

    const pollRemainingMs = deadline - Date.now();
    if (pollRemainingMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await delay(Math.min(REDEMPTION_STATUS_POLL_INTERVAL_MS, pollRemainingMs));
    }
  }

  trackCounter("GiftCard_RedeemPollExhausted");
  return { outcome: REDEMPTION_POLL_OUTCOMES.Exhausted, polls };
};
