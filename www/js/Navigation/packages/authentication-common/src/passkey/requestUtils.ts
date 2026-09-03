import { type AxiosPromise, getApiErrorCodes } from "@rbx/core-scripts/http";
import { Result } from "./result";

const parseErrorCode = (error: unknown): number | null => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return null;
  }

  return getApiErrorCodes(error.data)[0] ?? null;
};

export const toEnum = <T>(enumType: T, value: unknown): T[keyof T] | null => {
  if (enumType == null) {
    return null;
  }

  if (Object.values(enumType).includes(value)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return value as T[keyof T];
  }

  return null;
};

const getAxiosErrorStatusCode = (error: unknown): number | null => {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null;
  }

  const status: unknown = error.status ?? null;
  if (typeof status !== "number") {
    return null;
  }

  return status;
};

export const toResult = async <T, M>(
  request: AxiosPromise<T>,
  errorEnum: M,
  additionalProcessingFunction?: (unProcessedResult: T) => T,
): Promise<Result<T, M[keyof M] | null>> => {
  try {
    const response = await request;
    if (additionalProcessingFunction !== undefined) {
      return Result.ok(additionalProcessingFunction(response.data));
    }
    return Result.ok(response.data);
  } catch (error) {
    const errorCode = parseErrorCode(error);
    const errorStatusCode = getAxiosErrorStatusCode(error);
    return Result.error(toEnum(errorEnum, errorCode), error, errorStatusCode);
  }
};
