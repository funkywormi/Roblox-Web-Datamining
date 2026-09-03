/** Equal jitter: `backoff/2 + random * backoff/2` so delay stays within `[backoff/2, backoff]`. */

const backOffWithEqualJitter = (base: number, retries: number, power: number, maxDelay: number) => {
  const backoff = Math.min(maxDelay, base * retries ** power);
  const withEqualJitter = backoff / 2 + (Math.random() * backoff) / 2;
  return withEqualJitter;
};

/**
 * Computes a single sleep duration (ms) using capped exponential growth and **equal jitter**
 * (AWS-style: half fixed, half random within the backoff window).
 *
 * Used by `pollQueryResponse` after cumulative polling delay exceeds its threshold.
 *
 * @param miliseconds — Base delay scaled by `retries ** power` before cap and jitter.
 * @param power — Exponent applied to `retries` (typically `2` for exponential backoff).
 * @param retries — Current attempt index (1-based from caller); larger values yield longer backoff until `maxDelayInMiliseconds`.
 * @param maxDelayInMiliseconds — Upper bound (ms) on the pre-jitter backoff before jitter is applied.
 * @returns Floored delay in milliseconds, suitable for `setTimeout`.
 */
const exponentialBackoffWithJitter = (
  miliseconds: number,
  power: number,
  retries: number,
  maxDelayInMiliseconds: number
): number => {
  const sleep = backOffWithEqualJitter(miliseconds, retries, power, maxDelayInMiliseconds);
  return Math.floor(sleep);
};

export default exponentialBackoffWithJitter;
