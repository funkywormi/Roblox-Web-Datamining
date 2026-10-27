/** User moderation API path returning the account's active restriction for an abuse vector. */
const NOT_APPROVED_PATH = "/v1/not-approved";

/** User moderation API path that acknowledges (dismisses) an intervention. */
const DISMISS_INTERVENTION_PATH = "/v1/dismiss-intervention";

/** Safety Dashboard landing page where the user can view their account status and violations. */
const SAFETY_DASHBOARD_PATH = "/safety-dashboard";

/** Last-resort origin when the host-provided website URL is not a valid absolute URL. */
const PRODUCTION_WEBSITE_URL = "https://www.roblox.com";

/** Moderation detail endpoint for a single abuse vector. */
export const getModerationDetailUrl = (userModerationApiUrl: string, abuseVector: string): string =>
  `${userModerationApiUrl}${NOT_APPROVED_PATH}?abuseVector=${encodeURIComponent(abuseVector)}`;

/** Endpoint used to acknowledge an intervention so it stops being surfaced. */
export const getDismissInterventionUrl = (userModerationApiUrl: string): string =>
  `${userModerationApiUrl}${DISMISS_INTERVENTION_PATH}`;

/**
 * Safety Dashboard appeals destination. Links to a specific violation when a UID is available and
 * falls back to the violations list. `websiteUrl` should point to the Roblox main site. Invalid
 * bases fall back to production (`https://www.roblox.com`).
 */
export const getSafetyDashboardAppealsUrl = (websiteUrl: string, violationUid?: string): string => {
  let url: URL;
  try {
    url = new URL(SAFETY_DASHBOARD_PATH, websiteUrl);
  } catch {
    url = new URL(SAFETY_DASHBOARD_PATH, PRODUCTION_WEBSITE_URL);
  }

  if (violationUid) {
    url.searchParams.set("vid", violationUid);
  } else {
    url.hash = "/violations";
  }

  return url.toString();
};
