import environmentUrls from "@rbx/environment-urls";

const { helpSite } = environmentUrls;

/**
 * User moderation API endpoint that returns the user's account standing and active
 * feature restrictions.
 */
export const ACCOUNT_STANDING_URL = `${environmentUrls.userModerationApi}/v1/account-standing`;

/**
 * User moderation API endpoint that returns personalized educational content (recommended
 * rules) for the authenticated user.
 */
export const RECOMMENDED_RULES_URL = `${environmentUrls.userModerationApi}/v1/recommended-rules`;

/** Auth API endpoint used to log the user out. */
export const LOGOUT_URL = `${environmentUrls.authApi}/v2/logout`;

/** Roblox website home page, used to redirect the user after logout or account reactivation. */
export const HOME_URL = `${environmentUrls.websiteUrl}/`;

/** Roblox Help & Safety page; the parent page users typically arrive from. */
export const HELP_SAFETY_URL = `${environmentUrls.websiteUrl}/help-safety`;

/**
 * Roblox website origin. Supplied to the Universal Feature Restrictions package so it can build
 * its own appeals destinations against the current environment.
 */
export const WEBSITE_URL = environmentUrls.websiteUrl;

/**
 * Base URL of the user moderation API, injected into the Universal Feature Restrictions package.
 */
export const USER_MODERATION_API_URL = environmentUrls.userModerationApi;

/** Public Community Standards page explaining the rules users are expected to follow. */
export const COMMUNITY_STANDARDS_URL = "https://about.roblox.com/community-standards";

/** Help page article for all knowledge and disclosures related to appeals. */
export const CONTENT_MODERATION_HELP_URL = `${helpSite}/hc/articles/360000245263`;

/**
 * Customer support / chat support form - surfaced to users to allow them to appeal through the
 * Support Form if they can't see the violation that they want to appeal.
 */
export const SUPPORT_FORM_URL = "/support";

/** Moderation appeal service endpoint used to create an appeal for one of a user's violations. */
export const getCreateAppealUrl = (userId: number | null): string =>
  `${environmentUrls.apiGatewayUrl}/moderation-appeal-service/v2/users/${userId}/appeals`;

/**
 * Moderation appeal service endpoint that returns whether the user can appeal a
 * given violation directly, or must first complete an IDV pre-condition.
 */
export const getAppealEligibilityUrl = (userId: number | null, violationId: string): string =>
  `${environmentUrls.apiGatewayUrl}/moderation-appeal-service/v2/users/${userId}/violations/${violationId}/appeal-eligibility`;
