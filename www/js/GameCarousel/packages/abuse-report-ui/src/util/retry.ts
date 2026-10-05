/**
 * Retries an async function up to a specified number of times on error.
 *
 * @example
 * ```ts
 * const result = await retryNTimes(3, async () => {
 *   return await fetchData();
 * });
 * ```
 */
export async function retryNTimes<T>(times: number, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= times; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      lastError = error;
      // Don't retry on the last attempt
      if (attempt === times) {
        throw error;
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
