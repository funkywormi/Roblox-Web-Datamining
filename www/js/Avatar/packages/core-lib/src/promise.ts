export type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

/** Manual polyfill of `Promise.withResolvers`, since it is not baseline widely available. */
export const withResolvers = <T>(): PromiseWithResolvers<T> => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** Create a {@link Promise} that resolves after at least the specified number of milliseconds. */
export const timeout = (milliseconds: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });

/**
 * Wraps a {@link Promise}-creating function and limits the maximum number of in flight requests.
 *
 * If the maximum number of requests are in flight (as specified by {@link concurrency}),
 * then additional requests/calls will be queued for future execution.
 *
 * This function has no ordering guarantees. I.e., any call can complete before or after any other call.
 *
 * ```
 * const myFnWithQueue = queue(3, x => Promise.resolve(x)); // there can be at most 3 in flight requests
 * const requests = [1, 2, 3, 4, 5];
 * const responses = await Promise.all(requests.map(myFnWithQueue));
 * ```
 */
export const queue = <Args extends readonly unknown[], T>(
  concurrency: number,
  fn: (...args: Args) => Promise<T>,
): ((...args: Args) => Promise<T>) => {
  let numInFlight = 0;
  const arrQueue: (readonly [Args, PromiseWithResolvers<T>])[] = [];

  const next = () => {
    // We expect the queue to be reasonably sized, so shifting the whole array is fine.
    const nextItem = arrQueue.shift();
    if (nextItem === undefined) {
      numInFlight -= 1;
    } else {
      const [args, { resolve, reject }] = nextItem;
      fn(...args)
        .then(resolve)
        .catch(reject)
        .finally(next);
    }
  };

  return (...args) => {
    if (numInFlight < concurrency) {
      numInFlight += 1;
      return fn(...args).finally(next);
    }

    const resolvers = withResolvers<T>();
    arrQueue.push([args, resolvers]);
    return resolvers.promise;
  };
};

/**
 * The options to control batching behavior for {@link batch} and {@link batchQuery}.
 *
 * A batch will be sent once the `maxSize` is reached (if defined) or once `delay` passes
 * after the first item in a batch is requested, whichever comes first.
 */
export type BatchOptions = {
  /** The number of milliseconds to wait for additional items after the first item in a batch is requested. */
  readonly delay: number;
  /**
   * The maximum number of items to put in a batch.
   *
   * Once the `maxSize` number of items is reached, a batch is immediately sent,
   * bypassing and clearing the `delay` timeout.
   *
   * If this is not provided, then there is no limit to the batch size, and all the requested items in a `delay`
   * time span will be included in the batch request.
   */
  readonly maxSize?: number;
};

/**
 * Wraps a {@link Promise}-creating function that takes an array of items
 * and returns a new function that takes in a single item but with batching behavior built in.
 *
 * See {@link BatchOptions} for how to control the batching behavior.
 *
 * This function is mainly useful for side effects. See {@link batchQuery} for a variant of this function that
 * extracts the items from a batch response.
 *
 * This function has no ordering guarantees. I.e., any batch can complete before or after any other batch.
 *
 * ```
 * // A batch is sent once 3 items are requested or 50ms passes.
 * const myFnWithBatching = batch({ delay: 50, maxSize: 3 }, batch => {
 *   return Promise.resolve(); // some side-effect request
 * });
 * const requests = [1, 2, 3, 4, 5];
 * await Promise.all(requests.map(myFnWithBatching));
 * ```
 */
export const batch = <Q, R>(
  options: BatchOptions,
  fn: (queries: Q[]) => Promise<R>,
): ((query: Q) => Promise<R>) => {
  const { delay, maxSize } = options;

  let queries = [] as Q[];
  let resolvers = withResolvers<R>();
  let timeout: ReturnType<typeof setTimeout>;

  const fetch = () => {
    const { resolve, reject } = resolvers;
    const batch = queries;

    queries = [];
    resolvers = withResolvers();

    fn(batch).then(resolve).catch(reject);
  };

  return query => {
    if (queries.length === 0) {
      timeout = setTimeout(fetch, delay);
    }
    queries.push(query);
    const { promise } = resolvers;
    if (maxSize != null && queries.length >= maxSize) {
      clearTimeout(timeout);
      fetch();
    }
    return promise;
  };
};

/**
 * Wraps a {@link Promise}-creating function that takes an array of items
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
 *   batch => Promise.resolve(batch), // perform your batch request here
 *   (response, query) => null, // extract item from batch response here
 * );
 * const requests = [1, 2, 3, 4, 5];
 * const responses = await Promise.all(requests.map(myFnWithBatching));
 *
 * const key = 1;
 * useQuery({
 *   queryKey: ["myFn", key],
 *   queryFn: () => myFnWithBatching(key),
 * });
 * ```
 */
export const batchQuery = <Q, R, T>(
  options: BatchOptions,
  fn: (queries: Q[]) => Promise<R>,
  extract: (response: R, query: Q) => T,
): ((query: Q) => Promise<T>) => {
  const batched = batch(options, fn);
  return query => batched(query).then(response => extract(response, query));
};
