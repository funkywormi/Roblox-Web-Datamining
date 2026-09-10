import { AbortError, abortErrorFromSignal } from "./abort";
import { AsyncResult, err, ok } from "./result";
import { queue as queuePromise, batch as batchPromise, BatchOptions } from "./promise";

/**
 * Create an {@link AsyncResult} that resolves after at least the specified number of milliseconds
 * or when the given {@link AbortSignal} is triggered.
 *
 * If the timeout was aborted, then an {@link AbortError} is returned. Otherwise, `null` is returned.
 */
export const abortableTimeout = (
  milliseconds: number,
  signal: AbortSignal,
): AsyncResult<null, AbortError> =>
  AsyncResult.fromExecutor(resolve => {
    if (signal.aborted) {
      resolve(err(abortErrorFromSignal(signal)));
      return;
    }

    const timeout = setTimeout(() => {
      resolve(ok(null));
    }, milliseconds);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve(err(abortErrorFromSignal(signal)));
      },
      { once: true },
    );
  });

/**
 * Wraps an {@link AsyncResult}-creating function and limits the maximum number of in flight requests.
 *
 * If the maximum number of requests are in flight (as specified by {@link concurrency}),
 * then additional requests/calls will be queued for future execution.
 *
 * ```
 * const myFnWithQueue = queue(3, x => okAsync(x)); // there can be at most 3 in flight requests
 * const requests = [1, 2, 3, 4, 5];
 * const results = await AsyncResult.all(requests.map(myFnWithQueue));
 * ```
 */
export const queue = <Args extends readonly unknown[], T, E>(
  concurrency: number,
  fn: (...args: Args) => AsyncResult<T, E>,
): ((...args: Args) => AsyncResult<T, E>) => {
  const queued = queuePromise(concurrency, (args: Args) => fn(...args).promise);
  return (...args) => AsyncResult.fromPromiseResult(queued(args));
};

export type { BatchOptions };

/**
 * Wraps an {@link AsyncResult}-creating function that takes an array of items
 * and returns a new function that takes in a single item but with batching behavior built in.
 *
 * See {@link BatchOptions} for how to control the batching behavior.
 *
 * This function is mainly useful for side effects. See {@link batchQuery} for a variant of this function that
 * extracts the items from a batch response.
 *
 * ```
 * // A batch is sent once 3 items are requested or 50ms passes.
 * const myFnWithBatching = batch({ delay: 50, maxSize: 3 }, batch => {
 *   return okAsync(null); // some side-effect request
 * });
 * const requests = [1, 2, 3, 4, 5];
 * const results = await AsyncResult.all(requests.map(myFnWithBatching));
 * ```
 */
export const batch = <Q, R, E>(
  options: BatchOptions,
  fn: (queries: Q[]) => AsyncResult<R, E>,
): ((query: Q) => AsyncResult<R, E>) => {
  const batched = batchPromise(options, (queries: Q[]) => fn(queries).promise);
  return query => AsyncResult.fromPromiseResult(batched(query));
};

/**
 * Wraps an {@link AsyncResult}-creating function that takes an array of items
 * and returns a new function that takes in a single item but with batching behavior built in.
 *
 * See {@link BatchOptions} for how to control the batching behavior.
 *
 * If you don't need the response data (e.g., your function only performs side effects),
 * then see {@link batch} as another variant of this function that doesn't require the `extract` parameter.
 *
 * This function has no ordering guarantees. I.e., any batch can complete before or after any other batch.
 *
 * This function also does not do query deduplication. Please use `useQuery` from `@tanstack/react-query` in addition.
 *
 * ```
 * const myFnWithBatching = batchQuery(
 *   { delay: 50, maxSize: 3 }, // a batch is sent once 3 items are requested or 50ms passes
 *   batch => okAsync(batch), // perform your batch request here
 *   (response, query) => null, // extract item from batch response here
 * );
 * const requests = [1, 2, 3, 4, 5];
 * const results = await AsyncResult.all(requests.map(myFnWithBatching));
 *
 * const key = 1;
 * useQuery({
 *   queryKey: ["myFn", key],
 *   queryFn: () => myFnWithBatching(key).getOrThrow(),
 * });
 * ```
 */
export const batchQuery = <Q, R, E, T>(
  options: BatchOptions,
  fn: (queries: Q[]) => AsyncResult<R, E>,
  extract: (response: R, query: Q) => T,
): ((query: Q) => AsyncResult<T, E>) => {
  const batched = batch(options, fn);
  return query => batched(query).map(response => extract(response, query));
};
