export const magicLinkTokenQueryParam = "magicLinkToken";

let cachedMagicLinkToken: string | null | undefined;

const returnUrlQueryParams = ["returnUrl", "ReturnUrl"];

const getReturnUrlParamKey = (params: URLSearchParams): string | undefined =>
  returnUrlQueryParams.find(key => params.get(key));

const getReturnUrlFromQueryString = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const key = getReturnUrlParamKey(params);
  return key ? params.get(key) : null;
};

const getMagicLinkTokenFromReturnUrl = (returnUrl: string): string | null => {
  try {
    const parsed = new URL(returnUrl, window.location.origin);
    return parsed.searchParams.get(magicLinkTokenQueryParam);
  } catch {
    const queryIndex = returnUrl.indexOf("?");
    if (queryIndex === -1) {
      return null;
    }
    return new URLSearchParams(returnUrl.slice(queryIndex + 1)).get(magicLinkTokenQueryParam);
  }
};

export const resetMagicLinkTokenCache = (): void => {
  cachedMagicLinkToken = undefined;
};

// Matches /parental-requests with an optional locale prefix, e.g. /ja/parental-requests.
const parentalRequestsPathPattern = /^(?:\/[a-z]{2}(?:-[a-z0-9]+)?)?\/parental-requests\/?$/i;

/**
 * Whether the magic link points at the parental-requests flow, which is the only destination that
 * earns the expired-link copy telling a parent to go check pending requests in settings. Every
 * other destination — account settings included — takes the generic copy.
 */
export const isParentalRequestsMagicLink = (): boolean => {
  const returnUrl = getReturnUrlFromQueryString();
  if (!returnUrl) {
    return false;
  }

  try {
    return parentalRequestsPathPattern.test(new URL(returnUrl, window.location.origin).pathname);
  } catch {
    return false;
  }
};

/** Drops a spent magic-link token from a return URL before post-login navigation. */
export const stripMagicLinkTokenFromUrl = (url: string): string => {
  if (!url) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const urlWithoutHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const queryIndex = urlWithoutHash.indexOf("?");

  if (queryIndex === -1) {
    return url;
  }

  const params = new URLSearchParams(urlWithoutHash.slice(queryIndex + 1));
  if (!params.has(magicLinkTokenQueryParam)) {
    return url;
  }

  params.delete(magicLinkTokenQueryParam);
  const search = params.toString();
  const path = urlWithoutHash.slice(0, queryIndex);
  return `${path}${search ? `?${search}` : ""}${hash}`;
};

/**
 * Reads a magic-link token from the login page query string. When ASP.NET redirects
 * an unauthenticated /my/account visit, the token is nested inside ReturnUrl rather
 * than on the login URL directly — hoisting mirrors traceIdUtils' ReturnUrl handling.
 */
export const getMagicLinkTokenFromQueryString = (): string | null => {
  if (cachedMagicLinkToken !== undefined) {
    return cachedMagicLinkToken;
  }

  const topLevelToken = new URLSearchParams(window.location.search).get(magicLinkTokenQueryParam);
  if (topLevelToken) {
    cachedMagicLinkToken = topLevelToken;
    return topLevelToken;
  }

  const returnUrl = getReturnUrlFromQueryString();
  if (!returnUrl) {
    cachedMagicLinkToken = null;
    return null;
  }

  const nestedToken = getMagicLinkTokenFromReturnUrl(returnUrl);
  cachedMagicLinkToken = nestedToken;
  return nestedToken;
};

/**
 * Takes the token out of the visible login URL once it has been read, covering both the top-level
 * param and the copy nested inside ReturnUrl. Redemption uses the cached value, so the token never
 * needs to stay in the address bar, in history, or in anything that logs the URL.
 */
export const removeMagicLinkTokenFromLoginUrl = (): void => {
  const params = new URLSearchParams(window.location.search);
  let didChange = false;

  if (params.has(magicLinkTokenQueryParam)) {
    params.delete(magicLinkTokenQueryParam);
    didChange = true;
  }

  const returnUrlKey = getReturnUrlParamKey(params);
  if (returnUrlKey) {
    const returnUrl = params.get(returnUrlKey) ?? "";
    const strippedReturnUrl = stripMagicLinkTokenFromUrl(returnUrl);
    if (strippedReturnUrl !== returnUrl) {
      params.set(returnUrlKey, strippedReturnUrl);
      didChange = true;
    }
  }

  if (!didChange) {
    return;
  }

  const search = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
  );
};
