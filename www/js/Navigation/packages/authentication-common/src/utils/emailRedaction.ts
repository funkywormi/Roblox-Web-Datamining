/**
 * Returns the email with all but the first local-part character replaced by
 * a fixed five-asterisk run, e.g. `alice@example.com` → `a*****@example.com`.
 *
 * Matches the shape used by the legacy WebApps email upsell
 * (`WebApps/Roblox.Authentication.WebApp/.../emailUpsellModal/utils/emailUtils.js`)
 * Precondition: `email` is a valid address containing an `@`.
 */
export const redactEmailAddress = (email: string): string => {
  const atCharIndex = email.indexOf("@");
  const firstChar = email.substring(0, 1);
  return `${firstChar}*****${email.substring(atCharIndex)}`;
};

export default redactEmailAddress;
