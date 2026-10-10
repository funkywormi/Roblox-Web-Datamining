import * as json from "@rbx/core-lib/json";
import type { JsonSerializable } from "@rbx/core-lib/json";

type ErrorWithMessage = {
  message: string;
};

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage =>
  error != null &&
  typeof error === "object" &&
  "message" in error &&
  typeof error.message === "string";

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError;

  return (
    json
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      .serialize(maybeError as JsonSerializable)
      .map(json => new Error(json))
      .getOrElse(() => new Error(String(maybeError)))
  );
};

export const getErrorMessage = (error: unknown): string => toErrorWithMessage(error).message;
