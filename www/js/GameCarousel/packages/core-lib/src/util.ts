import { ValueOf } from "./commonTypes";

export const noop = (): void => {
  // do nothing
};

export const identity = <T>(x: T): T => x;

/**
 * Checks whether a value is present in an array. Unlike `array.includes`, this function does not
 * cause a type error if the array element type and the provided value have different types.
 *
 * This is useful if you have a constant array of string literals and want to check if a string is
 * one of the literals. Normally, this would be a type error as type `string` is not type
 * compatible with string literal types.
 *
 * ```
 * const options = ["optionA", "optionB"] as const;
 * const userInput: string = "optionB";
 *
 * if (arrayIncludes(options, userInput)) {
 *   // `userInput` has type `"optionA" | "optionB"` at this point.
 * }
 * ```
 */
export const arrayIncludes = <T>(values: readonly T[], x: unknown): x is T =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (values as unknown[]).includes(x);

/**
 * Checks whether a string is an enum case.
 *
 * ```
 * enum Example {
 *   CaseA = "caseA",
 *   CaseB = "caseB",
 * }
 * const userInput: string = "caseA";
 *
 * if (isStringEnum(Example, userInput)) {
 *   // `userInput` has type `ValueOf<typeof Example>` at this point which is the same type as `Example`.
 * }
 * ```
 */
export const isStringEnum = <E extends Readonly<Record<string, string>>>(
  enumObj: E,
  x: string,
): x is ValueOf<E> => Object.values(enumObj).includes(x);

/**
 * Get a value from a record by key.
 *
 * This function is useful when you have a record or object with a defined set of keys/fields.
 * In that case, TypeScript won't allow you to index into the record with any arbitrary string
 * without performing a type cast. This function takes in a record and performs the type cast
 * automatically, so that you can pass any string as the key.
 *
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
 */
export const recordGet = <T>(record: Readonly<Record<string, T>>, key: string): T | undefined =>
  record[key];
