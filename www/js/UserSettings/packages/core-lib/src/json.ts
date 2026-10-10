import { scan } from "secure-json-parse";
import type { ZodMiniType } from "zod/mini";
import * as z from "zod/mini";
import { AsyncResult, err, Ok, ok, Result } from "./result";
import { zodSafeParse, zodSafeParseAsync } from "./zod";

export type JsonPrimitive = string | number | boolean | null;

/**
 * Describes the set of types that can be serialized as JSON.
 *
 * Note that some data loss is allowed. E.g., `undefined` values in arrays or objects will be serialized as
 * `null` or dropped entirely, respectively. Additionally, `Infinity` and `NaN` will be serialized
 * as `null`. Also, we accept objects with a custom `toJson` method.
 */
export type JsonSerializable =
  | JsonPrimitive
  | readonly (JsonSerializable | undefined)[]
  | { readonly [key: string]: JsonSerializable | undefined }
  | { readonly toJson: () => string };

/** The value returned when derserializing a JSON string. */
export type DeserializedJson =
  | JsonPrimitive
  | DeserializedJson[]
  | { [key: string]: DeserializedJson };

/**
 * The error returned when a string could not be parsed into JSON.
 *
 * Possible error cases are:
 * - `Syntax`: the string was not valid JSON.
 * - `Validation`: the resulting JS value failed validation with the given Zod schema.
 * - `PrototypeProperty`:
 *   encountered at least one object that either:
 *   - has a property called `__proto__`.
 *   - has a property called `constructor` whose value is another object with a property called `prototype`.
 *
 *   Objects satisfying one of the above are disallowed to help prevent prototype pollution.
 *   For more information see:
 *   - https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution
 *   - https://www.npmjs.com/package/secure-json-parse
 */
export type JsonDeserializationErrorCause<T> =
  | { readonly code: "Syntax"; readonly error: Error }
  | { readonly code: "Validation"; readonly error: z.core.$ZodError<T> }
  | { readonly code: "PrototypeProperty"; readonly error: Error };

/**
 * The error returned when a string could not be parsed into JSON.
 *
 * Possible error cases are:
 * - `Syntax`: the string was not valid JSON.
 * - `Validation`: the resulting JS value failed validation with the given Zod schema.
 * - `PrototypeProperty`:
 *   encountered at least one object that either:
 *   - has a property called `__proto__`.
 *   - has a property called `constructor` whose value is another object with a property called `prototype`.
 *
 *   Objects satisfying one of the above are disallowed to help prevent prototype pollution.
 *   For more information see:
 *   - https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Prototype_pollution
 *   - https://www.npmjs.com/package/secure-json-parse
 */
export class JsonDeserializationError<T = never> extends Error {
  constructor(readonly cause: JsonDeserializationErrorCause<T>) {
    super(cause.error.message, { cause });
  }
}

/**
 * The error returned when a JavaScript value could not be turned into JSON.
 *
 * This can happen if the value contains a circular reference.
 */
export class JsonSerializationError extends Error {
  constructor(readonly cause: Error) {
    super(cause.message, { cause });
  }
}

const jsonParse = <T>(json: string): Result<DeserializedJson, JsonDeserializationError<T>> => {
  let data;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, no-restricted-globals
    data = JSON.parse(json) as DeserializedJson;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return err(new JsonDeserializationError({ code: "Syntax", error: e as Error }));
  }

  if (data != null && typeof data === "object") {
    try {
      scan(data);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return err(new JsonDeserializationError({ code: "PrototypeProperty", error: e as Error }));
    }
  }

  return ok(data);
};

/**
 * Deserialize a JSON string into a JavaScript value.
 *
 * See {@link JsonDeserializationError} for the possible error cases.
 */
export const deserializeUntyped = (
  json: string,
): Result<DeserializedJson, JsonDeserializationError> => jsonParse(json);

/**
 * Deserialize a JSON string and perform validation using the given `zod/mini` schema.
 *
 * See {@link JsonDeserializationError} for the possible error cases.
 *
 * ```
 * import * as z from "zod/mini";
 * import { jsonDeserialize } from "@rbx/core-lib";
 *
 * const MySchema = z.object({ foo: z.string() });
 * type MyType = z.infer<typeof MySchema>;
 *
 * const result = jsonDeserialize(MySchema, '{ foo: "" }');
 * const value: MyType | null = result.getOrNull();
 * ```
 */
export const deserialize = <T>(
  schema: ZodMiniType<T>,
  json: string,
): Result<T, JsonDeserializationError<T>> =>
  jsonParse<T>(json).andThen(value =>
    zodSafeParse(schema, value).mapErr(
      error => new JsonDeserializationError({ code: "Validation", error }),
    ),
  );

/**
 * Deserialize a JSON string and perform validation using the given `zod/mini` schema.
 *
 * Use this function instead of {@link deserialize} if your schema uses async transformations or refinements.
 *
 * See {@link JsonDeserializationError} for the possible error cases.
 */
export const deserializeAsync = <T>(
  schema: ZodMiniType<T>,
  json: string,
): AsyncResult<T, JsonDeserializationError<T>> =>
  jsonParse<T>(json).andThenAsync(value =>
    zodSafeParseAsync(schema, value).mapErr(
      error => new JsonDeserializationError({ code: "Validation", error }),
    ),
  );

type NonCircular =
  | JsonPrimitive
  | readonly (JsonPrimitive | undefined)[]
  | Readonly<Record<string, JsonPrimitive | undefined>>;

/**
 * Serialize a JavaScript value into a JSON string.
 *
 * This might fail and return an error if {@link value} contains a circular reference.
 * Note that if the type of {@link value} can be statically inferred to not be circular,
 * then you can access the resulting value directly:
 * ```
 * const str = jsonSerialize({ foo: "bar" }).value;
 * ```
 */
export const serialize = <T extends JsonSerializable>(
  value: T,
  space?: string | number,
): T extends NonCircular
  ? Ok<string, JsonSerializationError>
  : Result<string, JsonSerializationError> => {
  try {
    // eslint-disable-next-line no-restricted-globals
    return ok(JSON.stringify(value, undefined, space));
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return err(new JsonSerializationError(e as Error)) as T extends NonCircular
      ? Ok<string, JsonSerializationError>
      : Result<string, JsonSerializationError>;
  }
};
