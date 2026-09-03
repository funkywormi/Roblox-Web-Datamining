type ResultCase<T, E = Error> = {
  /**
   * Returns whether this {@link Result} is {@link Ok}.
   *
   * This method will narrow the type of the of the {@link Result} to either {@link Ok} or {@link Err}.
   * ```
   * const result = ok("test");
   * if (result.isOk()) {
   *   // `result` will have type `Ok` here and you can access `result.value`
   * } else {
   *   // `result` will have type `Err` here and you can access `result.error`
   * }
   * ```
   */
  isOk(): this is Ok<T, E>;

  /**
   * Returns whether this {@link Result} is an {@link Err}.
   *
   * This method will narrow the type of the of the {@link Result} to either {@link Ok} or {@link Err}.
   * ```
   * const result = ok("test");
   * if (result.isErr()) {
   *   // `result` will have type `Err` here and you can access `result.error`
   * } else {
   *   // `result` will have type `Ok` here and you can access `result.value`
   * }
   * ```
   */
  isErr(): this is Err<T, E>;

  /**
   * Applies {@link mapping} to the {@link Ok} value if it exists and otherwise leaves any {@link Err} untouched.
   *
   * ```
   * const result = ok(42);
   * return result.map(x => x.toString());
   * ```
   */
  map<T2>(mapping: (value: T) => T2): Result<T2, E>;

  /**
   * Applies {@link mapping} to the {@link Err} value if it exists and otherwise leaves any {@link Ok} value untouched.
   *
   * ```
   * const unknownError = err(null as unknown);
   * return unknownError.mapErr(e => e instanceof Error ? e : new Error("unknown error"));
   * ```
   */
  mapErr<E2>(mapping: (error: E) => E2): Result<T, E2>;

  /**
   * Applies the given function to the {@link Ok} value if it exists and otherwise leaves any {@link Err} untouched.
   *
   * Unlike {@link Result.map}, this will flatten the nested {@link Result}s for you.
   *
   * ```
   * const positiveNum = ok(42).andThen(x => x >= 1 ? ok(x) : err(new Error("not positive")));
   * ```
   */
  andThen<T2, E2>(f: (value: T) => Result<T2, E2>): Result<T2, E | E2>;

  /**
   * Applies the given function to the {@link Ok} value if it exists and otherwise leaves any {@link Err} untouched.
   *
   * Unlike {@link Result.map}, this will flatten the nested {@link Result} and {@link AsyncResult} for you.
   *
   * ```
   * const positiveNum = ok(42).andThen(x => x >= 1 ? ok(x) : err(new Error("not positive")));
   * ```
   */
  andThenAsync<T2, E2>(f: (value: T) => AsyncResult<T2, E2>): AsyncResult<T2, E | E2>;

  /**
   * Applies the given function to the {@link Err} value if it exists and otherwise leaves any {@link Ok} value untouched.
   *
   * Unlike {@link AsyncResult.mapErr}, this will flatten the nested {@link Result}s for you.
   */
  orElse<T2, E2>(f: (error: E) => Result<T2, E2>): Result<T | T2, E2>;

  /**
   * Applies the given function to the {@link Err} value if it exists and otherwise leaves any {@link Ok} value untouched.
   *
   * Unlike {@link AsyncResult.mapErr}, this will flatten the nested {@link Result}s for you.
   */
  orElseAsync<T2, E2>(f: (error: E) => AsyncResult<T2, E2>): AsyncResult<T | T2, E2>;

  /**
   * Calls the given function with the {@link Ok} value if it exists and then returns the {@link Result} as is.
   *
   * ```
   * const result = ok(42);
   * return result.inspect(console.debug).map(x => x.toString());
   * ```
   */
  inspect(f: (value: T) => void): Result<T, E>;

  /**
   * Calls the given function with the {@link Err} value if it exists and then returns the {@link Result} as is.
   *
   * ```
   * const result = err<string, string>("some error");
   * return result.inspectErr(console.error).getOrDefault("default");
   * ```
   */
  inspectErr(f: (error: E) => void): Result<T, E>;

  /**
   * Applies the {@link Ok} value to the {@link onOk} function if it exists and otherwise applies
   * the {@link Err} value to the {@link onErr} function.
   *
   * ```
   * const result = ok<string, Error>("test");
   * return result.match(
   *   value => `Success: ${value}`,
   *   error => `Error: ${error.message}`,
   * );
   * ```
   */
  match<T2, T3 = T2>(onOk: (value: T) => T2, onErr: (error: E) => T3): T2 | T3;

  /** Returns the {@link Ok} value if it exists and otherwise returns the provided {@link defaultValue}. */
  getOrDefault(defaultValue: T): T;

  /** Returns the {@link Ok} value if it exists and otherwise returns `null`. */
  getOrNull(): T | null;

  /** Returns the {@link Ok} value if it exists and otherwise runs and returns {@link thunk}. */
  getOrElse(thunk: () => T): T;

  /**
   * Returns the {@link Ok} value if it exists and otherwise throws the {@link Err} value.
   *
   * If {@link E} is not an {@link Error}, this function is typed to return `never`.
   * Use {@link Result.mapErr} to transform the error value into an {@link Error}.
   *
   * This method should only be used in particular cases where it makes sense. For example:
   * 1. It fails loud and fast, and so is easy to catch and fix in CI or testing.
   *    ```
   *    // On import, this would throw an error and be very visible.
   *    export const someUrl = Url.parse("not a valid url").getOrThrow();
   *
   *    // In a test file:
   *    expect(result.getOrThrow()).toEqual("some value");
   *    ```
   * 2. It is behind an error boundary, try catch statement, or other known error handler.
   *    It is only recommended to do this if the error handler is co-located with the call to `getOrThrow`.
   *    I.e., the error handler and the `getOrThrow` call are near each other in the same file.
   *    ```
   *    // `useQuery` catches uncaught errors from the `queryFn`.
   *    const query = useQuery({
   *      queryKey: [someUrl],
   *      queryFn: () => http.get(someUrl).getOrThrow(),
   *    });
   *    ```
   */
  getOrThrow(): E extends Error ? T : never;

  /** Returns the {@link Err} value if it exists and otherwise returns `null`. */
  getErrOrNull(): E | null;
};

/**
 * The `Ok` variant of a {@link Result}, representing an operation that successfully completed.
 *
 * The successful value can be accessed via {@link value}.
 *
 * See {@link Result} for more information and examples.
 */
export class Ok<T, E = Error> implements ResultCase<T, E> {
  constructor(readonly value: T) {}

  /** Cast the Err generic from `E` to some other `E2`. */
  cast<E2>(): Ok<T, E2> {
    // The error generic does not correspond to any runtime value and can be safely casted.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return this as unknown as Ok<T, E2>;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isOk(): this is Ok<T, E> {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isErr(): this is Err<T, E> {
    return false;
  }

  map<T2>(mapping: (value: T) => T2): Result<T2, E> {
    return new Ok(mapping(this.value));
  }
  mapErr<E2>(_mapping: (error: E) => E2): Result<T, E2> {
    return this.cast();
  }

  andThen<T2, E2>(f: (value: T) => Result<T2, E2>): Result<T2, E | E2> {
    return f(this.value);
  }
  andThenAsync<T2, E2>(f: (value: T) => AsyncResult<T2, E2>): AsyncResult<T2, E | E2> {
    return f(this.value);
  }

  orElse<T2, E2>(_f: (error: E) => Result<T2, E2>): Result<T | T2, E2> {
    return this.cast();
  }
  orElseAsync<T2, E2>(_f: (error: E) => AsyncResult<T2, E2>): AsyncResult<T | T2, E2> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return AsyncResult.fromResult(this.cast());
  }

  inspect(f: (value: T) => void): Result<T, E> {
    f(this.value);
    return this;
  }
  inspectErr(_f: (error: E) => void): Result<T, E> {
    return this;
  }

  match<T2, T3 = T2>(onOk: (value: T) => T2, _onErr: (error: E) => T3): T2 | T3 {
    return onOk(this.value);
  }

  getOrDefault(_defaultValue: T): T {
    return this.value;
  }
  getOrNull(): T | null {
    return this.value;
  }
  getOrElse(_thunk: () => T): T {
    return this.value;
  }
  getOrThrow(): E extends Error ? T : never {
    // @ts-expect-error Purposefully adding a `never` case to discourage throwing non-error values.
    return this.value;
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getErrOrNull(): E | null {
    return null;
  }
}

/**
 * The `Err` variant of a {@link Result}, representing an operation that failed.
 *
 * The error value can be accessed via {@link error}.
 *
 * See {@link Result} for more information and examples.
 */
export class Err<T, E = Error> implements ResultCase<T, E> {
  constructor(readonly error: E) {}

  /** Cast the Ok generic from `T` to some other `T2`. */
  cast<T2>(): Err<T2, E> {
    // The ok generic does not correspond to any runtime value and can be safely casted.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return this as unknown as Err<T2, E>;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isOk(): this is Ok<T, E> {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  isErr(): this is Err<T, E> {
    return true;
  }

  map<T2>(_mapping: (value: T) => T2): Result<T2, E> {
    return this.cast();
  }
  mapErr<E2>(mapping: (error: E) => E2): Result<T, E2> {
    return new Err(mapping(this.error));
  }

  andThen<T2, E2>(_f: (value: T) => Result<T2, E2>): Result<T2, E | E2> {
    return this.cast();
  }
  andThenAsync<T2, E2>(_f: (value: T) => AsyncResult<T2, E2>): AsyncResult<T2, E | E2> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return AsyncResult.fromResult(this.cast());
  }

  orElse<T2, E2>(f: (error: E) => Result<T2, E2>): Result<T | T2, E2> {
    return f(this.error);
  }
  orElseAsync<T2, E2>(f: (error: E) => AsyncResult<T2, E2>): AsyncResult<T | T2, E2> {
    return f(this.error);
  }

  inspect(_f: (value: T) => void): Result<T, E> {
    return this;
  }
  inspectErr(f: (error: E) => void): Result<T, E> {
    f(this.error);
    return this;
  }

  match<T2, T3 = T2>(_onOk: (value: T) => T2, onErr: (error: E) => T3): T2 | T3 {
    return onErr(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getOrDefault(defaultValue: T): T {
    return defaultValue;
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getOrNull(): T | null {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getOrElse(thunk: () => T): T {
    return thunk();
  }
  getOrThrow(): E extends Error ? T : never {
    // Should return `never` if E does not extend Error.
    // eslint-disable-next-line @typescript-eslint/only-throw-error, no-restricted-syntax
    throw this.error;
  }
  getErrOrNull(): E | null {
    return this.error;
  }
}

type ExtractOk<R> = R extends Result<infer T, unknown> ? T : never;
type ExtractErr<R> = R extends Result<unknown, infer E> ? E : never;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  /**
   * Merge an array of {@link Result}s into a single `Result` that will be either
   * the first {@link Err} value, or an array of all the {@link Ok} values if none of the
   * `Result`s errored.
   *
   * ```
   * const result = Result.all([ok("something"), ok(42)]);
   * if (result.isOk()) {
   *   const [str, num] = result.value;
   * }
   * ```
   */
  export const all = <T extends readonly Result<unknown, unknown>[] | []>(
    results: T,
  ): Result<{ -readonly [K in keyof T]: ExtractOk<T[K]> }, ExtractErr<T[number]>> => {
    type OkArray = { -readonly [K in keyof T]: ExtractOk<T[K]> };
    type ErrUnion = ExtractErr<T[number]>;

    const i = results.findIndex(res => res.isErr());
    if (i === -1) {
      return new Ok(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        results.map(res => res.getOrNull()) as OkArray,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return results[i] as Result<OkArray, ErrUnion>;
  };
}

/**
 * {@link Result} is a type that represents either a success ({@link Ok}) or a failure ({@link Err}).
 *
 * This is modeled after the `Result` type from Rust and other ML-family languages.
 *
 * Use {@link Result.isOk} or {@link Result.isErr} to narrow a `Result` into the `Ok` or the `Err` case.
 * ```
 * const result = ok("test");
 * if (result.isOk()) {
 *   // `result` will have type `Ok` here and you can access `result.value`
 * } else {
 *   // `result` will have type `Err` here and you can access `result.error`
 * }
 * ```
 *
 * You can also use {@link Result.match} to handle both cases at the same time.
 * ```
 * const result = ok<string, Error>("test");
 * const value = result.match(
 *   value => `Success: ${value}`,
 *   error => `Error: ${error.message}`,
 * );
 * ```
 *
 * To discard/ignore the error and get the value, use one of the `get` methods:
 * ```
 * const result = ok("test");
 * const v1 = result.getOrDefault("default value");
 * const v2 = result.getOrNull();
 * const v3 = result.getOrElse(() => computeDefaultValue());
 * const v4 = result.getOrThrow(); // Not recommended in most cases
 * ```
 *
 * To inspect the error (e.g., before discarding), use {@link Result.inspectErr}:
 * ```
 * const result = err<string, string>("some error");
 * return result.inspectErr(console.error).getOrDefault("default");
 * ```
 *
 * To create a `Result`, use {@link ok}, {@link err}, or {@link tryCatch}.
 * ```
 * const okResult = ok("value");
 * const errorResult = err(new Error("some error"));
 * const result = tryCatch(
 *   () => functionThatMayThrow(),
 *   e => e instanceof Error ? e : new Error("unknown error"),
 * );
 * ```
 *
 * To modify a `Result`, use {@link Result.map}, {@link Result.mapErr}, or {@link Result.andThen}.
 * ```
 * const numResult = ok(42);
 * const strResult = numResult.map(x => x.toString()).
 *
 * const unknownError = err(null as unknown);
 * const errorResult = unknownError.mapErr(e => e instanceof Error ? e : new Error("unknown error"));
 *
 * const positiveNum = ok(42).andThen(x => x >= 1 ? ok(x) : err(new Error("not positive")));
 * ```
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

/**
 * An asynchronous, promise-like {@link Result}.
 *
 * This type is essentially a wrapper around a `Promise<Result<T, E>>`, but allows you to still
 * access most of the {@link Result} API like {@link Result.map}, {@link Result.getOrDefault},
 * {@link Result.inspectErr}, etc.
 *
 * To create an `AsyncResult`, use {@link okAsync}, {@link errAsync}, {@link tryCatchAsync},
 * {@link AsyncResult.fromResult}, or {@link AsyncResult.fromPromise}.
 *
 * See {@link Result} for more information and examples.
 */
export class AsyncResult<T, E = Error> implements PromiseLike<Result<T, E>> {
  /** The inner {@link Promise} {@link Result}. */
  readonly promise: Promise<Result<T, E>>;

  private constructor(promise: Promise<Result<T, E>>) {
    this.promise = promise;
  }

  /** Creates an {@link AsyncResult} from a {@link Result}. */
  static fromResult<T, E>(result: Result<T, E>): AsyncResult<T, E> {
    return new AsyncResult(Promise.resolve(result));
  }

  /**
   * Creates an {@link AsyncResult} from a {@link Promise}.
   *
   * It is assumed that the promise can throw and an error handler must be provided.
   *
   * See {@link fromPromiseResult} instead if the promise resolves to a {@link Result}.
   */
  static fromPromise<T, E>(promise: Promise<T>, onError: (error: unknown) => E): AsyncResult<T, E> {
    return new AsyncResult(
      promise.then(value => new Ok<T, E>(value)).catch((error: unknown) => new Err(onError(error))),
    );
  }

  /**
   * Creates an {@link AsyncResult} from a `Promise<Result<T, E>>`.
   *
   * It is assumed that the promise cannot throw and no error handler is needed.
   *
   * See {@link fromPromise} instead if the promise resolves to a type other than {@link Result}.
   */
  static fromPromiseResult<T, E>(promise: Promise<Result<T, E>>): AsyncResult<T, E> {
    return new AsyncResult(promise);
  }

  /**
   * Creates an {@link AsyncResult} from a callback.
   *
   * Similar to `new Promise(resolve => { ... })`.
   */
  static fromExecutor<T, E>(
    executor: (
      resolve: (value: Result<T, E> | Promise<Result<T, E>> | AsyncResult<T, E>) => void,
    ) => void,
  ): AsyncResult<T, E> {
    return new AsyncResult(
      new Promise(resolve => {
        executor(resolve);
      }),
    );
  }

  /** Creates an {@link AsyncResult} from a {@link Result}-like value. */
  static from<T, E>(
    result: Result<T, E> | Promise<Result<T, E>> | AsyncResult<T, E>,
  ): AsyncResult<T, E> {
    return result instanceof AsyncResult
      ? result
      : result instanceof Promise
        ? AsyncResult.fromPromiseResult(result)
        : AsyncResult.fromResult(result);
  }

  /**
   * Converts an async function that returns a `Promise<Result<T, E>>` to a function that returns an `AsyncResult<T, E>`.
   *
   * This allows you to use the `async/await` syntax while also returning an `AsyncResult`.
   *
   * ```
   * const myFunction = AsyncResult.fn(async () => {
   *   const result = await http.get(url, schema);
   *   if (result.isErr()) {
   *     return result;
   *   }
   *
   *   // other code...
   * });
   * ```
   */
  static fn<T, E, Args extends unknown[] | []>(
    f: (...args: Args) => Promise<Result<T, E>>,
  ): (...args: Args) => AsyncResult<T, E> {
    return (...args) => AsyncResult.fromPromiseResult(f(...args));
  }

  /**
   * Merge an array of {@link AsyncResult}s into a single `AsyncResult` that will be either
   * the first {@link Err} value, or an array of all the {@link Ok} values if none of the
   * `AsyncResult`s errored.
   *
   * To get all the error values (not just the first one), use {@link Promise.all}.
   *
   * Like {@link Promise.all}, this method will return early once any of the `AsyncResult` reject
   * (an uncaught error was thrown). However, this method will not return early if one of the
   * `AsyncResult`s is resolved to an {@link Err} value. Instead, this method waits until all the
   * `AsyncResult`s are resolved to some {@link Result} value. This is better behavior, because it
   * keeps your promises running in order. When {@link Promise.all} returns early due to an uncaught
   * exception in one promise, the other in-progress promises will continue executing even after
   * control flow has already been returned to the original {@link Promise.all} caller.
   *
   * ```
   * const result = await AsyncResult.all([okAsync("something"), okAsync(42)]);
   * if (result.isOk()) {
   *   const [str, num] = result.value;
   * }
   * ```
   */
  static all<T extends readonly AsyncResult<unknown, unknown>[] | []>(
    values: T,
  ): AsyncResult<
    { -readonly [K in keyof T]: ExtractOk<Awaited<T[K]>> },
    ExtractErr<Awaited<T[number]>>
  > {
    return new AsyncResult(Promise.all(values).then(Result.all));
  }

  /**
   * Applies {@link mapping} to the {@link Ok} value if it exists and otherwise leaves any {@link Err} untouched.
   *
   * ```
   * const result = okAsync(42);
   * return result.map(x => x.toString());
   * ```
   */
  map<T2>(mapping: (value: T) => T2 | Promise<T2>): AsyncResult<T2, E> {
    return new AsyncResult(
      this.promise.then(async result =>
        result.isOk() ? new Ok(await mapping(result.value)) : result.cast(),
      ),
    );
  }

  /**
   * Applies {@link mapping} to the {@link Err} value if it exists and otherwise leaves any {@link Ok} value untouched.
   *
   * ```
   * const unknownError = errAsync(null as unknown);
   * return unknownError.mapErr(e => e instanceof Error ? e : new Error("unknown error"));
   * ```
   */
  mapErr<E2>(mapping: (error: E) => E2 | Promise<E2>): AsyncResult<T, E2> {
    return new AsyncResult(
      this.promise.then(async result =>
        result.isErr() ? new Err(await mapping(result.error)) : result.cast(),
      ),
    );
  }

  /**
   * Applies the given function to the {@link Ok} value if it exists and otherwise leaves any {@link Err} untouched.
   *
   * Unlike {@link AsyncResult.map}, this will flatten the nested {@link Result}s for you.
   */
  andThen<T2, E2>(
    f: (value: T) => Result<T2, E2> | AsyncResult<T2, E2> | Promise<Result<T2, E2>>,
  ): AsyncResult<T2, E | E2> {
    return new AsyncResult(
      this.promise.then(result => {
        if (result.isErr()) {
          return result.cast();
        }
        const res = f(result.value);
        return res instanceof AsyncResult ? res.promise : res;
      }),
    );
  }

  /**
   * Applies the given function to the {@link Err} value if it exists and otherwise leaves any {@link Ok} value untouched.
   *
   * Unlike {@link AsyncResult.mapErr}, this will flatten the nested {@link Result}s for you.
   */
  orElse<T2, E2>(
    f: (error: E) => Result<T2, E2> | AsyncResult<T2, E2> | Promise<Result<T2, E2>>,
  ): AsyncResult<T | T2, E2> {
    return new AsyncResult(
      this.promise.then(result => {
        if (result.isOk()) {
          return result.cast();
        }
        const res = f(result.error);
        return res instanceof AsyncResult ? res.promise : res;
      }),
    );
  }

  /**
   * @deprecated Use {@link map}, {@link andThen}, {@link mapErr}, or {@link orElse} instead.
   */
  then<T2, T3>(
    onfulfilled?: (value: Result<T, E>) => T2 | PromiseLike<T2>,
    onrejected?: (reason: unknown) => T3 | PromiseLike<T3>,
  ): PromiseLike<T2 | T3> {
    return this.promise.then(onfulfilled, onrejected);
  }

  /**
   * Calls the given function with the {@link Ok} value if it exists and then returns the {@link AsyncResult} as is.
   *
   * ```
   * const result = okAsync(42);
   * return result.inspect(console.debug).map(x => x.toString());
   * ```
   */
  inspect(f: (value: T) => void): AsyncResult<T, E> {
    return new AsyncResult(
      this.promise.then(result => {
        if (result.isOk()) {
          f(result.value);
        }
        return result;
      }),
    );
  }

  /**
   * Calls the given function with the {@link Err} value if it exists and then returns the {@link AsyncResult} as is.
   *
   * ```
   * const result = errAsync<string, string>("some error");
   * return result.inspectErr(console.error).getOrDefault("default");
   * ```
   */
  inspectErr(f: (error: E) => void): AsyncResult<T, E> {
    return new AsyncResult(
      this.promise.then(result => {
        if (result.isErr()) {
          f(result.error);
        }
        return result;
      }),
    );
  }

  /**
   * Applies the {@link Ok} value to the {@link onOk} function if it exists and otherwise applies
   * the {@link Err} value to the {@link onErr} function.
   *
   * ```
   * const result = okAsync<string, Error>("test");
   * return result.match(
   *   value => `Success: ${value}`,
   *   error => `Error: ${error.message}`,
   * );
   * ```
   */
  match<T2, T3 = T2>(onOk: (value: T) => T2, onErr: (error: E) => T3): Promise<T2 | T3> {
    return this.promise.then(result => result.match(onOk, onErr));
  }

  /** Returns the {@link Ok} value if it exists and otherwise returns the provided {@link defaultValue}. */
  getOrDefault(defaultValue: T): Promise<T> {
    return this.promise.then(result => result.getOrDefault(defaultValue));
  }

  /** Returns the {@link Ok} value if it exists and otherwise returns `null`. */
  getOrNull(): Promise<T | null> {
    return this.promise.then(result => result.getOrNull());
  }

  /** Returns the {@link Ok} value if it exists and otherwise runs and returns {@link thunk}. */
  getOrElse(thunk: () => T): Promise<T> {
    return this.promise.then(result => result.getOrElse(thunk));
  }

  /**
   * Returns the {@link Ok} value if it exists and otherwise throws the {@link Err} value.
   *
   * If {@link E} is not an {@link Error}, this function is typed to return `never`.
   * Use {@link AsyncResult.mapErr} to transform the error value into an {@link Error}.
   *
   * This method should only be used in particular cases where it makes sense. For example:
   * 1. It fails loud and fast, and so is easy to catch and fix in CI or testing.
   *    ```
   *    // On import, this would throw an error and be very visible.
   *    export const someUrl = Url.parse("not a valid url").getOrThrow();
   *
   *    // In a test file:
   *    expect(result.getOrThrow()).toEqual("some value");
   *    ```
   * 2. It is behind an error boundary, try catch statement, or other known error handler.
   *    It is only recommended to do this if the error handler is co-located with the call to `getOrThrow`.
   *    I.e., the error handler and the `getOrThrow` call are near each other in the same file.
   *    ```
   *    // `useQuery` catches uncaught errors from the `queryFn`.
   *    const query = useQuery({
   *      queryKey: [someUrl],
   *      queryFn: () => http.get(someUrl).getOrThrow(),
   *    });
   *    ```
   */
  getOrThrow(): E extends Error ? Promise<T> : never {
    // @ts-expect-error Purposefully adding a `never` case to discourage throwing non-error values.
    return this.promise.then(result => result.getOrThrow());
  }

  /** Returns the {@link Err} value if it exists and otherwise returns `null`. */
  getErrOrNull(): Promise<E | null> {
    return this.promise.then(result => result.getErrOrNull());
  }
}

/** Creates an {@link Ok} {@link Result}. */
export const ok = <T, E = never>(value: T): Ok<T, E> => new Ok(value);

/** Creates an {@link Err} {@link Result}. */
export const err = <T = never, E = unknown>(error: E): Err<T, E> => new Err(error);

/**
 * Wraps the given function in a try catch,  returning an {@link Ok} {@link Result} if it succeeds.
 * Otherwise, {@link onError} is called and an {@link Err} {@link Result} is returned.
 */
export const tryCatch = <T, E>(f: () => T, onError: (error: unknown) => E): Result<T, E> => {
  try {
    return ok(f());
  } catch (e: unknown) {
    return err(onError(e));
  }
};

/** Creates an {@link Ok} {@link AsyncResult}. */
export const okAsync = <T, E = never>(value: T): AsyncResult<T, E> =>
  AsyncResult.fromResult(ok(value));

/** Creates an {@link Err} {@link AsyncResult}. */
export const errAsync = <T = never, E = unknown>(error: E): AsyncResult<T, E> =>
  AsyncResult.fromResult(err(error));

/**
 * Wraps the given promise-returning function in a try catch, returning an {@link Ok}
 * {@link AsyncResult} if it succeeds. Otherwise, {@link onError} is called and an {@link Err}
 * {@link AsyncResult} is returned.
 */
export const tryCatchAsync = <T, E>(
  f: () => Promise<T>,
  onError: (error: unknown) => E,
): AsyncResult<T, E> => AsyncResult.fromPromise(f(), onError);
