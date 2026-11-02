import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";

/**
 * Frontend half of the expired parent email token metrics. Each event is joined with the backend
 * ParentEmailTokenCreated event on `tokenHash`.
 * One pager: https://roblox.atlassian.net/wiki/spaces/FAMEX/pages/5373198401
 */

// Mapped to ingest_proto.accountmanagement_parent_email_token_redemption by the
// ParentEmailTokenRedemption schema in proto-schemas.
export const parentEmailTokenRedemptionEventName = "parentEmailTokenRedemption";
export const parentEmailTokenRedemptionContext = "parentEmailToken";

/**
 * Query param added to a login URL whose magic link was minted on the page rather than sent in an
 * email (e.g. after an account upgrade). Login sends no redemption events for it, since there is no
 * ParentEmailTokenCreated event to join with.
 */
export const skipParentEmailTokenRedemptionEventsQueryParam = "skipTokenRedemptionEvents";

export enum ParentEmailTokenType {
  PasswordlessSignup = "passwordlessSignup",
  VpcMagicLink = "vpcMagicLink",
}

export enum ParentEmailTokenSurface {
  Signup = "signup",
  ParentalRequests = "parentalRequests",
  AccountSettings = "accountSettings",
  Login = "login",
}

export enum ParentEmailTokenRedemptionResult {
  Opened = "opened",
  Success = "success",
  // Any rejected token. The backend can't tell expired tokens from used or malformed ones.
  Expired = "expired",
  ExpiredAlreadyLoggedIn = "expiredAlreadyLoggedIn",
}

export enum ParentEmailTokenMetricsType {
  VpcConsent = "vpcConsent",
  VpcLink = "vpcLink",
  VpcLinkAndConsent = "vpcLinkAndConsent",
  OdpUpgrade = "odpUpgrade",
  WeeklyDigestViewActivity = "weeklyDigestViewActivity",
  WeeklyDigestUnsubscribe = "weeklyDigestUnsubscribe",
  Unknown = "unknown",
}

// Each path may carry an optional locale prefix, e.g. /ja/parental-requests.
const localePrefix = "(?:/[a-z]{2}(?:-[a-z0-9]+)?)?";
const parentalRequestsPathPattern = new RegExp(`^${localePrefix}/parental-requests/?$`, "i");
const accountSettingsPathPattern = new RegExp(`^${localePrefix}/my/account/?$`, "i");
const signupPathPattern = new RegExp(`^${localePrefix}/CreateAccount/?$`, "i");

/**
 * Derives the email the token was sent in from the URL it was redeemed on. Login passes its
 * `returnUrl`, since the token was emailed for the page login returns to. These rules mirror how
 * child-requests-api and batch-notifications-processor pick the backend metrics type.
 */
export const getParentEmailTokenMetricsType = (url: string): ParentEmailTokenMetricsType => {
  let parsed: URL;
  try {
    parsed = new URL(url, "https://www.roblox.com");
  } catch {
    return ParentEmailTokenMetricsType.Unknown;
  }
  const params = parsed.searchParams;

  if (parentalRequestsPathPattern.test(parsed.pathname)) {
    if (params.get("flowType") === "odpUpgrade") {
      return ParentEmailTokenMetricsType.OdpUpgrade;
    }
    const hasLinkRequest = params.has("linkRequestId");
    const hasConsent = params.has("consentId");
    if (hasLinkRequest && hasConsent) {
      return ParentEmailTokenMetricsType.VpcLinkAndConsent;
    }
    if (hasLinkRequest) {
      return ParentEmailTokenMetricsType.VpcLink;
    }
    if (hasConsent) {
      return ParentEmailTokenMetricsType.VpcConsent;
    }
    return ParentEmailTokenMetricsType.Unknown;
  }

  if (accountSettingsPathPattern.test(parsed.pathname)) {
    const target = params.get("target");
    if (target === "viewActivity") {
      return ParentEmailTokenMetricsType.WeeklyDigestViewActivity;
    }
    if (target === "emailPreferences") {
      return ParentEmailTokenMetricsType.WeeklyDigestUnsubscribe;
    }
    return ParentEmailTokenMetricsType.Unknown;
  }

  if (signupPathPattern.test(parsed.pathname)) {
    // New parents only get sign up tokens for link requests, alone or with a consent request.
    return params.get("requestType") === "LinkToChild"
      ? ParentEmailTokenMetricsType.VpcLink
      : ParentEmailTokenMetricsType.VpcLinkAndConsent;
  }

  return ParentEmailTokenMetricsType.Unknown;
};

/**
 * SHA-256 of the raw token as lowercase hex, matching ParentEmailTokenCreated.token_hash. The input
 * must be the URL-decoded token, encoded as UTF-8, with no salt or trimming.
 */
export const hashParentEmailToken = async (token: string): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
};

export type TParentEmailTokenRedemptionEvent = {
  token: string;
  tokenType: ParentEmailTokenType;
  metricsType: ParentEmailTokenMetricsType;
  surface: ParentEmailTokenSurface;
  result: ParentEmailTokenRedemptionResult;
};

/**
 * Sends a redemption event; best effort, never throws. Await it before navigating away so the
 * token is hashed before the page unloads.
 */
export const sendParentEmailTokenRedemptionEvent = async ({
  token,
  tokenType,
  metricsType,
  surface,
  result,
}: TParentEmailTokenRedemptionEvent): Promise<void> => {
  try {
    const tokenHash = await hashParentEmailToken(token);
    eventStreamService.sendEventWithTarget(
      parentEmailTokenRedemptionEventName,
      parentEmailTokenRedemptionContext,
      {
        tokenHash,
        tokenType,
        metricsType,
        surface,
        result,
        // The event stream defaults `url` to the full href, which would carry the raw token.
        url: globalThis.location.pathname,
      },
    );
  } catch {
    // Telemetry must never block a parent from using the link.
  }
};

const openedTokenHashesStorageKey = "parentEmailTokenOpenedHashes";

/**
 * Sends `opened` at most once per token per tab session, so reloading a page that keeps the token
 * in its URL is not counted as another click.
 */
export const sendParentEmailTokenOpenedEventOnce = async (
  event: Omit<TParentEmailTokenRedemptionEvent, "result">,
): Promise<void> => {
  try {
    const tokenHash = await hashParentEmailToken(event.token);
    const storage = globalThis.sessionStorage;
    const stored: unknown = JSON.parse(storage.getItem(openedTokenHashesStorageKey) ?? "[]");
    const openedTokenHashes = Array.isArray(stored) ? stored.map(String) : [];
    if (openedTokenHashes.includes(tokenHash)) {
      return;
    }
    storage.setItem(openedTokenHashesStorageKey, JSON.stringify([...openedTokenHashes, tokenHash]));
  } catch {
    // Without storage, fall through and send; a duplicate `opened` is better than none.
  }
  await sendParentEmailTokenRedemptionEvent({
    ...event,
    result: ParentEmailTokenRedemptionResult.Opened,
  });
};
