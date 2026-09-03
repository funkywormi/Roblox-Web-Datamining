import { HttpError } from "@rbx/core-lib/http";

interface AvatarApiError {
  code: number;
  message: string;
}

interface AvatarApiErrorResponse {
  errors?: AvatarApiError[];
}

// Structural shape for the legacy (Axios) error fields these helpers read, without
// depending on `@rbx/core-scripts/http` (which must stay out of the Next.js bundle).
// The Next.js path produces a core-lib HttpError, handled by the `instanceof HttpError`
// and direct `error.errors` / `error.status` fallbacks below.
type LegacyHttpErrorShape = {
  response?: {
    status?: number;
    data?: AvatarApiErrorResponse;
  };
};

const AVATAR_EDITING_DISABLED_MESSAGE = "Not allowed to update avatar";

function getErrorsArray(error: unknown): AvatarApiError[] | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const errorObj = error as Record<string, unknown>;

  // Check for axios error structure: error.response.data.errors
  const axiosError = error as LegacyHttpErrorShape;
  if (axiosError.response?.data?.errors) {
    return axiosError.response.data.errors;
  }

  // Check if errors array is directly on the error object (e.g., error.errors)
  if (errorObj.errors && Array.isArray(errorObj.errors)) {
    return errorObj.errors as AvatarApiError[];
  }

  // Check if error has a data property with errors (e.g., error.data.errors)
  if (errorObj.data && typeof errorObj.data === "object") {
    const dataObj = errorObj.data as Record<string, unknown>;
    if (dataObj.errors && Array.isArray(dataObj.errors)) {
      return dataObj.errors as AvatarApiError[];
    }
  }

  return undefined;
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const errorObj = error as Record<string, unknown>;

  // Check for axios error structure: error.response.status
  const axiosError = error as LegacyHttpErrorShape;
  if (axiosError.response?.status) {
    return axiosError.response.status;
  }

  // Check if status is directly on the error object
  if (typeof errorObj.status === "number") {
    return errorObj.status;
  }

  // Check for statusCode property
  if (typeof errorObj.statusCode === "number") {
    return errorObj.statusCode;
  }

  return undefined;
}

export function isAvatarEditingDisabledError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const statusCode = getStatusCode(error);
  if (statusCode !== 403) {
    return false;
  }

  const errors = getErrorsArray(error);
  if (errors && Array.isArray(errors)) {
    // Axios / .NET path: the response body is available, so require the specific message.
    return errors.some(err => err.message === AVATAR_EDITING_DISABLED_MESSAGE);
  }

  // Next.js path: core-lib HttpError discards the response body (ResponseInfo omits Body), so the
  // "Not allowed to update avatar" message can't be read. A 403 from an avatar-edit endpoint is
  // overwhelmingly editing-disabled, so degrade to status-only detection here.
  // Follow-up: expose error bodies in @rbx/core-lib/http to restore message-level detection.
  if (error instanceof HttpError) {
    return true;
  }

  return false;
}

export default isAvatarEditingDisabledError;
