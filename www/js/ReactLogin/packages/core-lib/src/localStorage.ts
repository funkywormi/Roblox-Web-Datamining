/* eslint-disable no-restricted-globals */
import { ok, err, Result } from "./result";
import { deserializeUntyped, serialize, JsonPrimitive } from "./json";
import { ValueOf } from "./commonTypes";

/**
 * This type is more strict compared to `JsonSerializable`, since we want roundtrip serialization to
 * not change types if possible. `undefined` values in objects will still be dropped during
 * serialization, but because accessing a missing key also evaluates to `undefined`, then we assume
 * that this sufficient in most cases. The main gotcha is that `Infinity` and `NaN` will still be
 * serialized as `null`.
 */
export type LocalStorageJsonSerializable =
  | JsonPrimitive
  | readonly LocalStorageJsonSerializable[]
  | { readonly [key: string]: LocalStorageJsonSerializable | undefined };

/** Options for setting a local storage key and value. */
export type LocalStorageSetOptions = {
  /**
   * The number of milliseconds before the value being set expires.
   * If omitted, then the value will never expire and will also clear any previously set expiration.
   *
   * Note that the `maxAge` should not be provided or relied on for critical data. In some rare cases,
   * expired values may be returned and stored values may also get deleted early. I.e., this is
   * mainly intended to be used for caching purposes.
   */
  readonly maxAge?: number;
};

/**
 * The registry of local storage keys to values/types.
 *
 * Add entries to this type to enforce that:
 * 1. The same type is used when writing to a key as when reading from it.
 * 2. The type is JSON compatible.
 *
 * Note that this is an interface, so you can add entries from your own code and the declarations
 * will be merged. For example:
 * ```
 * import "@rbx/core-lib/local-storage";
 *
 * declare module "@rbx/core-lib/local-storage" {
 *   interface LocalStorageRegistry {
 *     myCustomKey: MyCustomSchema;
 *   }
 * }
 *
 * export {};
 * ```
 *
 * Deserialized values are type-casted without validation, since it enforced that the same type
 * is used during serialization. So, if you need to make changes to your registered types, then it
 * should be done in a forward-compatible way. E.g., removing fields, adding optional fields,
 * or changing types to unions won't cause issues. On the other hand, adding required fields or
 * removing union cases is not sound and can cause runtime issues. If you expect to make changes in
 * the future consider adding a `version` field to your schema.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LocalStorageRegistry {
  expiryList:
    | { version: 0; data: Record<string, number> }
    | { version: 1; data: LocalStorageJsonSerializable };
}

/**
 * This type is used to check that values put into local storage are JSON compatible.
 * If you get an error here, check that the entry you added to {@link LocalStorageRegistry} has a
 * type that is {@link JsonSerializable}.
 */
type AllEntriesAreJsonSerializable =
  ValueOf<LocalStorageRegistry> extends LocalStorageJsonSerializable ? true : never;
const _: AllEntriesAreJsonSerializable = true;

/**
 * Check if a key is present in local storage.
 *
 * Note that this is quicker/more efficient than `get(key) != null`, since {@link getItem} must
 * perform JSON deserialization.
 */
export const hasItem = (key: keyof LocalStorageRegistry): boolean => {
  try {
    return localStorage.getItem(key) != null;
  } catch {
    return false;
  }
};

/** Remove a value from local storage. */
export const removeItem = (key: keyof LocalStorageRegistry): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // do nothing
  }
};

const getItemIgnoreExpiry = <T extends keyof LocalStorageRegistry>(
  key: T,
): LocalStorageRegistry[T] | null => {
  let str: string | null = null;
  try {
    str = localStorage.getItem(key);
  } catch {
    // do nothing
  }
  // Since we control the serialization, we assume that deserialization cannot fail. If it somehow
  // does, then we return `null` and assume the data is corrupted/invalid and needs to be rewritten.
  //
  // We also perform a typecast here, since we assume that teams won't make breaking API changes for
  // their registered types. I.e., it's their responsibility.
  return str == null
    ? null
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      (deserializeUntyped(str).getOrNull() as LocalStorageRegistry[T] | null);
};

/**
 * The error returned when a write to local storage fails.
 *
 * Possible error cases are:
 * - `JsonSerialization`: an error occurred when serializing the value to JSON (i.e., a circular reference).
 * - `PageRefreshNeeded`: a new schema for the expiry list was encountered, and a page refresh is
 *   needed to correctly store the `maxAge` of entries in the new schema.
 * - `Unknown`: an unknown error occurred (the storage quota might be exceeded).
 */
export type LocalStorageWriteErrorCause =
  | { readonly code: "JsonSerialization"; readonly error: Error }
  | { readonly code: "Unknown"; readonly error: unknown }
  | { readonly code: "PageRefreshNeeded" };

/**
 * The error returned when a write to local storage fails.
 *
 * Possible error cases are:
 * - `JsonSerialization`: an error occurred when serializing the value to JSON (i.e., a circular reference).
 * - `PageRefreshNeeded`: a new schema for the expiry list was encountered, and a page refresh is
 *   needed to correctly store the `maxAge` of entries in the new schema.
 * - `Unknown`: an unknown error occurred (the storage quota might be exceeded).
 */
export class LocalStorageWriteError extends Error {
  constructor(readonly cause: LocalStorageWriteErrorCause) {
    super(cause.code, { cause });
  }
}

const setItemIgnoreExpiry = <T extends keyof LocalStorageRegistry>(
  key: T,
  value: LocalStorageRegistry[T],
): Result<null, LocalStorageWriteError> => {
  const jsonStr = serialize(value);
  if (jsonStr.isErr()) {
    return err(new LocalStorageWriteError({ code: "JsonSerialization", error: jsonStr.error }));
  }
  try {
    localStorage.setItem(key, jsonStr.value);
    return ok(null);
  } catch (error: unknown) {
    return err(
      new LocalStorageWriteError({
        code: "Unknown",
        error,
      }),
    );
  }
};

let nextExpiry = 0;

// Note that multiple tabs can read and write to local storage at the same time.
// We assume that the data stored with expiry is non-critical and thus allow the edge cases below.
//
// We do not attempt to ensure that `nextExpiry` is kept in sync with writes to the `expiryList`
// from other tabs. Considering that the expiry time is likely some constant plus the current time,
// then if another tab writes a new value, it will likely be with an expiry greater than to equal to
// the previous one, meaning the new `nextExpiry` is further in the future or equal to the out of
// sync `nextExpiry` stored by this tab. This is fine, since `removeExpiredItems` will simply check
// the `expiryList` a little early and get the updated `nextExpiry`. Otherwise, if the new
// `nextExpiry` is earlier than the previous `nextExpiry`, then expired values can be returned.
//
// There is another edge case where this tab checks the `expiryList` and sees that some key is
// expired. At the same time or shortly after, another tab then writes a new, non-expired value
// for that key. This tab then deletes the value, assuming it is still out of date. Fixing this
// would require adding a locking mechanism using a Broadcast channel. Again, we assume the data
// is not critical and will simply have to be refetched and rewritten.
const removeExpiredItems = (update?: {
  key: keyof LocalStorageRegistry;
  options: LocalStorageSetOptions;
}): Result<null, LocalStorageWriteError> => {
  nextExpiry = Number.MAX_SAFE_INTEGER;
  const expiryList = getItemIgnoreExpiry("expiryList");
  if (expiryList != null && expiryList.version !== 0) {
    return err(new LocalStorageWriteError({ code: "PageRefreshNeeded" }));
  }

  const now = Date.now();
  const newExpiryList: Record<string, number> = {};
  for (const [key, expiration] of Object.entries(expiryList?.data ?? {})) {
    if (key === update?.key) {
      const { maxAge } = update.options;
      if (maxAge != null) {
        const expiration = now + maxAge;
        nextExpiry = Math.min(nextExpiry, expiration);
        newExpiryList[key] = expiration;
      }
    } else {
      // The public API has stricter typing to prevent calling with an unknown key.
      // Technically any string is fine under the hood.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const k = key as keyof LocalStorageRegistry;
      if (now >= expiration) {
        removeItem(k);
      } else {
        nextExpiry = Math.min(nextExpiry, expiration);
        newExpiryList[k] = expiration;
      }
    }
  }
  return setItemIgnoreExpiry("expiryList", { version: 0, data: newExpiryList });
};

/** Get a value from local storage, if it exists. Returns `null` if it does not exist or has expired. */
export const getItem = <T extends keyof LocalStorageRegistry>(
  key: T,
): LocalStorageRegistry[T] | null => {
  if (Date.now() >= nextExpiry) {
    // We ignore the two error cases for `removeExpiredItems`:
    //
    // If we fail to write the new `expiryList` to local storage, the expired value(s) are still
    // removed from local storage. It's not useful or informative to the caller in any way
    // if the failed write error is bubbled up.
    //
    // The other failure case is that we encounter a new expiry list schema and do not know how to
    // read the new data to tell which items are expired. We treat this as an exceptional case
    // and return potentially expired items.
    removeExpiredItems();
  }
  return getItemIgnoreExpiry(key);
};

/**
 * Write a value to local storage. Returns a {@link Result} containing any {@link LocalStorageWriteError}s
 * that occurred if writing the value failed.
 */
export const setItem = <T extends keyof LocalStorageRegistry>(
  key: T,
  value: LocalStorageRegistry[T],
  options: LocalStorageSetOptions = {},
): Result<null, LocalStorageWriteError> =>
  removeExpiredItems({ key, options }).andThen(() => setItemIgnoreExpiry(key, value));
