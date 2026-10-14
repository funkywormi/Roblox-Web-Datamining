import getResponseFromError from './getResponseFromError';

// Copied from apps/creator-hub/modules/clients/utils/tryParseResponseError.ts, which packages
// cannot import.

type ErrorType = {
  errors: {
    code: number;
    message: string;
    userFacingMessage: string;
    fieldData?: unknown;
  }[];
};

export type ResponseErrorEntry = {
  code: number;
  message: string;
  userFacingMessage?: string;
  fieldData?: unknown;
};

export type ResponseError = ResponseErrorEntry & {
  status: number;
  allErrors?: ResponseErrorEntry[];
};

export default async function tryParseResponseError(err: unknown): Promise<ResponseError | null> {
  try {
    const response = getResponseFromError(err);
    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- response.json() is untyped
      const responseBody = (await response.json()) as ErrorType;
      if (responseBody.errors.length > 0) {
        const error = responseBody.errors[0];
        if (error) {
          return {
            status: response.status,
            code: error.code,
            message: error.message,
            userFacingMessage: error.userFacingMessage,
            fieldData: error.fieldData,
            allErrors: responseBody.errors.map((e) => ({
              code: e.code,
              message: e.message,
              userFacingMessage: e.userFacingMessage,
              fieldData: e.fieldData,
            })),
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}
