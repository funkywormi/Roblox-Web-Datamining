/**
 * Extract the `.message` property from an error object, or return a fallback.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object") {
    // Validated above — object that is not null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed by typeof check
    return value as Record<string, unknown>;
  }
  return null;
};

/**
 * Extract the HTTP status line from a rejected HTTP response.
 *
 * The core-scripts HTTP interceptor rejects with the raw AxiosResponse by
 * default (so `error.status` is the HTTP code), or with a full AxiosError when
 * `fullError: true` (so `error.response.status` is the code).
 */
export const getHttpStatus = (error: unknown): string | null => {
  const obj = asRecord(error);
  if (!obj) return null;

  const status = typeof obj.status === "number" ? obj.status : null;
  const statusText = typeof obj.statusText === "string" ? obj.statusText : null;

  if (status) {
    return statusText ? `${status} ${statusText}` : String(status);
  }

  // fullError path: error.response.status
  const resp = asRecord(obj.response);
  if (resp) {
    const respStatus = typeof resp.status === "number" ? resp.status : null;
    const respText = typeof resp.statusText === "string" ? resp.statusText : null;
    if (respStatus) {
      return respText ? `${respStatus} ${respText}` : String(respStatus);
    }
  }

  return null;
};

const MAX_BODY_LENGTH = 200;

/**
 * Extract and truncate the response body from a rejected HTTP response.
 *
 * Looks at `error.data` (default interceptor) then `error.response.data`
 * (fullError interceptor).
 */
export const getResponseBody = (error: unknown, maxLength = MAX_BODY_LENGTH): string | null => {
  const obj = asRecord(error);
  if (!obj) return null;

  const raw = obj.data ?? asRecord(obj.response)?.data;
  if (raw == null) return null;

  let str: string;
  if (typeof raw === "string") {
    str = raw;
  } else {
    try {
      str = JSON.stringify(raw);
    } catch {
      return "[unserializable]";
    }
  }
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};
