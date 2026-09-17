import type { ApiValidationErrorResponse } from '@rbx/custom-forms';

// `httpService` from core-utilities throws the response object directly, so
// validation error payloads live at `error.data`.
function extractServerErrors(error: unknown): ApiValidationErrorResponse | undefined {
  const err = error as { data?: unknown };
  const data = err?.data;
  if (
    data &&
    typeof data === 'object' &&
    'errors' in data &&
    Array.isArray((data as ApiValidationErrorResponse).errors)
  ) {
    return data as ApiValidationErrorResponse;
  }
  return undefined;
}

// eslint-disable-next-line import/prefer-default-export
export { extractServerErrors };
