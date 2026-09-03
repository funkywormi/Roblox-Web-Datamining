/**
 * Canonical screen identifiers for the logout upsell flow.
 * These string values do double duty: they are the modal's internal
 * state-machine keys (`showPasskeyUpsellModal`) + the analytics wire values
 * (`field`/`state` on the schematized auth events).
 */
export const LogoutUpsellScreen = {
  PasskeyUpsell: "passkeyUpsell",
  AddEmail: "addEmail",
  VerifyEmail: "verifyEmail",
} as const;

export type LogoutUpsellScreenName = (typeof LogoutUpsellScreen)[keyof typeof LogoutUpsellScreen];
