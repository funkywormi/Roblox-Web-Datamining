/** Similar to the `keyof` keyword, this type returns a union of the values of a type (instead of the keys). */
export type ValueOf<T> = T[keyof T];

/** Opposite of {@link Readonly}, removes the `readonly` modifier from all properties in `T`. */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/** Forces a type expression to be resolved/flattened into a regular object type for better documentation. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
declare class NominalTypeGuard<Name extends string, T> {
  private readonly _name: Name;
  private readonly _type: T;
}

/**
 * Also known as a `Brand` in the TS ecosystem, this type can be used to create a subtype of another type.
 *
 * That is, `SubType<Name, T>` can be used anywhere a `T` can be used, but a `T` cannot be used
 * anywhere a `SubType<Name, T>` is needed.
 *
 * Typically, this type is used to prevent mixing of unrelated values or to mark some input as validated.
 *
 * This type incurs no runtime overhead and has the same representation as `T`.
 *
 * ```
 * type UserId = SubType<"UserId", string>;
 *
 * // This is just an example, don't actually cast types without checking that it is safe.
 * const userId0: UserId = downcast("0");
 * const userId1 = downcast("1") satisfies UserId;
 *
 * type ValidatedInput = SubType<"ValidatedInput", string>;
 * ```
 */
export type SubType<Name extends string, T> = T & NominalTypeGuard<Name, T>;

/**
 * Downcast a super type `T` into a {@link SubType<_, T>}.
 *
 * NOTE: using this function is somewhat unsafe. When casting to the sub type, you must ensure
 * that you are upholding whatever invariants the sub type requires.
 *
 * ```
 * type UserId = SubType<"UserId", string>;
 *
 * // This is just an example, don't actually cast types without checking that it is safe.
 * const userId0: UserId = downcast("0");
 * const userId1 = downcast("1") satisfies UserId;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export const downcast = <Name extends string, T>(x: T): SubType<Name, T> => x as SubType<Name, T>;

/**
 * This type can be used to create runtime-transparent nominal types.
 *
 * That is, `NewType<Name, T>` has the same runtime representation as `T`, but it is not type
 * compatible with `T` or any other type besides itself (or `object`, `unknown`, or `any`).
 *
 * Typically, this type is used to prevent mixing of unrelated values or to create opaque types.
 *
 * ```
 * type Secret = NewType<"Secret", string>;
 *
 * type UserId = NewType<"UserId", string>;
 *
 * // This is just an example, don't actually cast types without checking that it is safe.
 * const userId0: UserId = castToNewType("0");
 * const userId1 = castToNewType("1") satisfies UserId;
 * const userIdNum = castFromNewType(userId0);
 * ```
 */
export type NewType<Name extends string, T> = NominalTypeGuard<Name, T>;

/**
 * Cast a value of type `T` into a {@link NewType<_, T>}.
 *
 * NOTE: using this function is somewhat unsafe. When casting to the new type, you must ensure
 * that you are upholding whatever invariants the new type requires.
 *
 * ```
 * type UserId = NewType<"UserId", string>;
 *
 * // This is just an example, don't actually cast types without checking that it is safe.
 * const userId0: UserId = castToNewType("0");
 * const userId1 = castToNewType("1") satisfies UserId;
 * ```
 */
export const castToNewType = <Name extends string, T>(x: T): NewType<Name, T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  x as NewType<Name, T>;

/**
 * Cast a {@link NewType<_, T>} back to its underlying `T` value.
 *
 * ```
 * type UserId = NewType<"UserId", string>;
 *
 * // This is just an example, don't actually cast types without checking that it is safe.
 * const userId0: UserId = castToNewType("0");
 * const userId1 = castToNewType("1") satisfies UserId;
 * const userIdNum = castFromNewType(userId0);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export const castFromNewType = <Name extends string, T>(x: NewType<Name, T>): T => x as T;
