import "./global";

/**
 * Similar to the `keyof` keyword, this type returns a union of the values of a type
 * (instead of the keys).
 */
export type ValueOf<T> = T[keyof T];

/**
 * A utility type to create adhoc sub types in TypeScript.
 *
 * E.g., `Brand<string, "SomeName">` is just a `string` under the hood and can be used as a string
 * wherever a type or function requires a string. However, a regular `string` cannot be used
 * wherever a branded string is required. Similarly, `Brand`s with different names are not type
 * compatible with each other.
 *
 * This is useful in practice in several ways.
 * 1. `Brand`s can be used to enforce/track data which has been validated or satisfies some other
 *    invariant.
 * 2. `Brand`s can be used to declare more descriptive types and prevent accidental argument swaps.
 *    E.g., `Brand<string, "UserId">` is not type compatible with `Brand<string, "PlaceId">`.
 *
 * Use the {@link brand} function to "create" a branded value.
 */
export type Brand<T, U> = T & { __brand: U };

/** Type casts a value to some {@link Brand}-ed type. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export const brand = <T, U>(value: T): Brand<T, U> => value as Brand<T, U>;

/** Type casts a {@link Brand}-ed type back to its underlying type. */
export const unbrand = <T, U>(value: Brand<T, U>): T => value;

/** Forces a type expression to be resolved/flattened into a regular object type for better documentation. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Checks whether a value is present in an array. Unlike `array.includes`, this function does not
 * cause a type error if the array element type and the provided value have different types.
 *
 * This is useful if you have a constant array of string literals and want to check if a string is
 * one of the literals. Normally, this would be a type error as type `string` is not type
 * compatible with string literal types.
 *
 * @example
 * ```
 * const options = ["optionA", "optionB"] as const;
 * const userInput: string = "optionB";
 *
 * if (arrayIncludes(options, userInput)) {
 *   // `userInput` has type `"optionA" | "optionB"` at this point.
 * }
 * ```
 *
 * @param values The array of values.
 * @param x The value to check if it is present in the array.
 * @returns A boolean indicating whether the value is included in the array. If true, then the
 * value's type will be updated to match that of the array element type.
 */
export const arrayIncludes = <T>(values: readonly T[], x: unknown): x is T =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (values as unknown[]).includes(x);

/**
 * Checks whether a value is present in a record/object, ignoring keys.
 *
 * This is useful to check if a string or number is an enum case.
 *
 * @example
 * ```
 * enum Example {
 *   CaseA = "caseA",
 *   CaseB = "caseB",
 * }
 * const userInput: string = "caseA";
 *
 * if (isValueOf(Example, userInput)) {
 *   // `userInput` has type `ValueOf<typeof Example>` at this point which is the same type as `Example`.
 * }
 * ```
 *
 * @param record The record/object of values.
 * @param x The value to check for.
 * @returns A boolean indicating whether the value is included in the record/object. If true, then the
 * value's type will be updated to be the {@link ValueOf} the record/object.
 */
export const isValueOf = <E extends Readonly<Record<string, unknown>>>(
  record: E,
  x: unknown,
): x is ValueOf<E> => Object.values(record).includes(x);

/**
 * Get a value from a record by key.
 *
 * This function is useful when you have a record or object with a defined set of keys/fields.
 * In that case, TypeScript won't allow you to index into the record with any arbitrary string
 * without performing a type cast. This function takes in a record and performs the type cast
 * automatically, so that you can pass any string as the key.
 *
 * @example
 * ```
 * type MyObject = {
 *   fieldA: string
 * };
 *
 * const myObject: MyObject = { fieldA: "test" };
 * const userInput: string = "fieldA";
 *
 * // This causes a TypeScript error:
 * // const value = myObject[userInput];
 *
 * // On the other hand, this works:
 * const value = recordGet(myObject, userInput);
 * ```
 *
 * @param record The record to index into.
 * @param key The key of the value to get.
 * @returns The value in the record for the given key, or `undefined` if it does not exist.
 */
export const recordGet = <T>(record: Readonly<Record<string, T>>, key: string): T | undefined =>
  record[key];
