import * as z from "zod/mini";
import { ZodMiniType } from "zod/mini";
import { AsyncResult, err, ok, Result } from "./result";

export const zodSafeParse = <T>(
  schema: ZodMiniType<T>,
  value: unknown,
): Result<T, z.core.$ZodError<T>> => {
  const result = schema.safeParse(value);
  return result.success ? ok(result.data) : err(result.error);
};

export const zodSafeParseAsync = <T>(
  schema: ZodMiniType<T>,
  value: unknown,
): AsyncResult<T, z.core.$ZodError<T>> =>
  AsyncResult.fromPromiseResult(
    schema
      .safeParseAsync(value)
      .then(result => (result.success ? ok(result.data) : err(result.error))),
  );
