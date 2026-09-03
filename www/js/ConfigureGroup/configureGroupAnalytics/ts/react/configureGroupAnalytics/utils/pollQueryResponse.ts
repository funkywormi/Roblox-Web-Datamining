import type { QueryResponse } from '@rbx/client-analytics-query-gateway/v1';
import exponentialBackoffWithJitter from './exponentialBackoffWithJitter';

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

type RaqiClientOptions = {
  maxAttempts: number;
  initialPollingInterval: number;
  maxAccumulativeDelayToStartBackoff: number;
};

/**
 * Default options for `pollQueryResponse` when polling the analytics-query-gateway until
 * `operation.done` is true.
 *
 * @property maxAttempts — Stop and throw after this many completed request rounds while still not done.
 * @property initialPollingInterval — Fixed delay (ms) between polls until cumulative wait exceeds
 *   `maxAccumulativeDelayToStartBackoff`, then backoff+jitter applies.
 * @property maxAccumulativeDelayToStartBackoff — Total elapsed wait (ms) before switching from fixed
 *   interval to exponential backoff with jitter.
 */
export const DEFAULT_RAQI_CLIENT_OPTIONS: RaqiClientOptions = {
  maxAttempts: 20,
  initialPollingInterval: 1500,
  maxAccumulativeDelayToStartBackoff: 4500
};

function isMetricsQueryComplete(response: QueryResponse): boolean {
  const op = response.operation;
  if (op == null) {
    return true;
  }
  return op.done === true;
}

/**
 * Polls a long-running metrics query: calls `makeRequest` until `response.operation.done === true`,
 * waiting between attempts using `DEFAULT_RAQI_CLIENT_OPTIONS` pacing (fixed interval, then
 * exponential backoff with equal jitter).
 *
 * @param makeRequest — Factory that performs one gateway call (e.g. POST metrics); invoked again after each wait.
 * @param options — Overrides for attempt cap and delay tuning; defaults to `DEFAULT_RAQI_CLIENT_OPTIONS`.
 * @returns The final `QueryResponse` when the operation is done and has no operation-level error.
 * @throws If max attempts are exceeded, if `operation.error` is set when done, or if `makeRequest` rejects.
 */
export async function pollQueryResponse(
  makeRequest: () => Promise<QueryResponse>,
  options: RaqiClientOptions = DEFAULT_RAQI_CLIENT_OPTIONS
): Promise<QueryResponse> {
  let response = await makeRequest();

  const { maxAttempts, initialPollingInterval, maxAccumulativeDelayToStartBackoff } = options;
  let attempts = 1;
  let accumulativeDelay = 0;

  while (!isMetricsQueryComplete(response)) {
    if (attempts > maxAttempts) {
      throw new Error('Error: reached max number of attempts');
    }

    const delay =
      accumulativeDelay > maxAccumulativeDelayToStartBackoff
        ? exponentialBackoffWithJitter(
            initialPollingInterval,
            2,
            attempts,
            maxAttempts * initialPollingInterval
          )
        : initialPollingInterval;

    // eslint-disable-next-line no-await-in-loop -- sleep between polls
    await sleep(delay);
    accumulativeDelay += delay;

    // eslint-disable-next-line no-await-in-loop -- polls until done
    response = await makeRequest();
    attempts += 1;
  }

  const err = response.operation?.error;
  if (err) {
    throw new Error(`Error ${String(err.code ?? '')}: ${String(err.message ?? 'unknown')}`);
  }

  return response;
}
