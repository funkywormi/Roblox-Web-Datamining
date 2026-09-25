/*
Referencing Roblox.AccountSecurity.WebApp/ts/common/request/common.ts
*/
// TODO: put this in a shared lib.
/**
 * Parses a JavaScript object, which can take on any type, into an array of
 * error codes based on the typical schema returned by our back-end.
 */
const getApiErrorCodes = (error: unknown): number[] => {
  const errorCodes: number[] = [];
  if (!error || typeof error !== "object") {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { errors } = error as Record<string, unknown>;
  if (!(errors instanceof Array)) {
    return [];
  }

  errors.forEach((errorObject: unknown) => {
    if (!errorObject || typeof errorObject !== "object") {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { code } = errorObject as Record<string, unknown>;
    if (typeof code === "number") {
      errorCodes.push(code);
    }
  });

  return errorCodes;
};

/**
 * Gets a single error code based on a JS object thrown by Axios.
 */
export const parseErrorCode = (error: unknown): number | null => {
  const errorCodes = getApiErrorCodes(error);
  // `typeof null === 'object'`, so the null check guards the `.data` access below.
  if (error && typeof error === "object") {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    getApiErrorCodes((error as Record<string, unknown>).data).forEach(item =>
      errorCodes.push(item),
    );
  }

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- `??` would preserve an error code of 0 instead of treating it as absent.
  return errorCodes[0] || null;
};

/**
 * Fetch the returnUrl returned in response
 */
export const fetchReturnUrl = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const errorObject: unknown = (error as Record<string, unknown>).data;

  if (!errorObject || typeof errorObject !== "object") {
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const url: unknown = (errorObject as Record<string, unknown>).returnUrl;
  return typeof url === "string" ? url : "";
};

export default {
  parseErrorCode,
  fetchReturnUrl,
};
