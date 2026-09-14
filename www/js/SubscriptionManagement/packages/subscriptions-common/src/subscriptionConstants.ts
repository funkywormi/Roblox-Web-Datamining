export const ONE_ROBUX_IN_MICROS = 1_000_000;

/** Terms every subscribe CTA links to. Not the Referral Program terms, which are their own page. */
export const SUBSCRIPTION_TERMS_URL = "https://www.roblox.com/info/terms";

/**
 * Referrer and recipient each get this many Robux on conversion. Hardcoded until the referral
 * backend owns the reward configuration.
 */
export const REFERRAL_REWARD_ROBUX = 100;

/** Query flag that opens the referrer dashboard on `/plus` (no nested router). */
export const PLUS_REFERRALS_QUERY_PARAM = "referrals";

/**
 * Canonical destination for nav, home, notifications, and the Plus invite card. Not
 * `/premium/membership`, which redirects to `/plus` and drops query params on the way.
 */
export const PLUS_REFERRALS_PATH = `/plus?${PLUS_REFERRALS_QUERY_PARAM}`;
