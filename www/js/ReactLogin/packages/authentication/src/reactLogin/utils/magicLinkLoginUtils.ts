import {
  getParentEmailTokenMetricsType,
  ParentEmailTokenMetricsType,
  ParentEmailTokenRedemptionResult,
  ParentEmailTokenSurface,
  ParentEmailTokenType,
  sendParentEmailTokenRedemptionEvent,
  skipParentEmailTokenRedemptionEventsQueryParam,
} from "@rbx/authentication-common/utils/parentEmailTokenRedemptionUtils";
import { errorCodes } from "../constants/loginConstants";

export const magicLinkTokenQueryParam = "magicLinkToken";

let cachedMagicLinkToken: string | null | undefined;
// Whether the cached token was nested inside ReturnUrl rather than a top-level query param.
let isCachedMagicLinkTokenFromReturnUrl = false;

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
  isCachedMagicLinkTokenFromReturnUrl = false;
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
  isCachedMagicLinkTokenFromReturnUrl = nestedToken !== null;
  return nestedToken;
};

const magicLinkTokenRejectedErrorCodes: ReadonlySet<number | null> = new Set([
  errorCodes.magicLinkInvalid,
  errorCodes.magicLinkExpired,
  errorCodes.magicLinkAlreadyRedeemed,
]);

/** Whether a failed magic-link login was rejected for the token itself, rather than e.g. an outage. */
export const isMagicLinkTokenRejectedErrorCode = (errorCode: number | null): boolean =>
  magicLinkTokenRejectedErrorCodes.has(errorCode);

/**
 * Sends a redemption event for the magic link being redeemed on login. Nothing is sent for a
 * token that was minted on the page rather than emailed (see
 * skipParentEmailTokenRedemptionEventsQueryParam).
 */
export const sendMagicLinkLoginRedemptionEvent = async (
  magicLinkToken: string,
  result: ParentEmailTokenRedemptionResult,
): Promise<void> => {
  if (
    new URLSearchParams(window.location.search).has(skipParentEmailTokenRedemptionEventsQueryParam)
  ) {
    return;
  }

  // The token was emailed for the page login returns to, so that page determines the email.
  const returnUrl = getReturnUrlFromQueryString();
  await sendParentEmailTokenRedemptionEvent({
    token: magicLinkToken,
    tokenType: ParentEmailTokenType.VpcMagicLink,
    metricsType: returnUrl
      ? getParentEmailTokenMetricsType(returnUrl)
      : ParentEmailTokenMetricsType.Unknown,
    surface: ParentEmailTokenSurface.Login,
    result,
  });
};

/**
 * Sends opened only when login is the first page the parent landed on. Parental requests and
 * account settings send opened themselves and hand the token to login as a top-level query param;
 * a token nested in ReturnUrl means the server redirected a signed-out parent straight here.
 */
export const sendMagicLinkLoginOpenedEvent = async (magicLinkToken: string): Promise<void> => {
  if (!isCachedMagicLinkTokenFromReturnUrl) {
    return;
  }
  await sendMagicLinkLoginRedemptionEvent(magicLinkToken, ParentEmailTokenRedemptionResult.Opened);
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
