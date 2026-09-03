import { trackError } from "../observability";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

type FailedResult = {
  success: false;
  error: "ABSENT" | "INVALID_TIMESTAMP" | "EXPIRED";
};

type SuccessResult = {
  success: true;
  value: number;
};

type Result = FailedResult | SuccessResult;

export function resolveLimitedTimeBonusDaysLeft(
  expirationTimestampMs: number | string | undefined,
): Result {
  // Promotion expiration is an optional field that is simply absent on most sections, so an
  // omitted value is a normal state rather than a malformed one. Reporting it would fire the
  // counter below on every render of every non-promotional section. An empty string still counts
  // as malformed, since the callers that pass a required field should never produce one.
  if (expirationTimestampMs === undefined) {
    return {
      success: false,
      error: "ABSENT",
    };
  }

  const expirationTimestamp = Number(expirationTimestampMs);

  if (
    (typeof expirationTimestampMs === "string" && expirationTimestampMs.trim() === "") ||
    !Number.isFinite(expirationTimestamp)
  ) {
    trackError("ResolveLimitedTimeBonusExpirationInvalidTimestamp");
    return {
      success: false,
      error: "INVALID_TIMESTAMP",
    };
  }

  const remainingMs = expirationTimestamp - Date.now();
  if (remainingMs <= 0) {
    return {
      success: false,
      error: "EXPIRED",
    };
  }

  return {
    success: true,
    value: Math.ceil(remainingMs / MS_PER_DAY),
  };
}
