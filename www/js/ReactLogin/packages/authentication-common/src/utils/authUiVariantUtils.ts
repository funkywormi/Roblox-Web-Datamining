export const authUiVariants = {
  control: "control",
  refreshSsoInline: "refreshSsoInline",
  refreshSsoDialog: "refreshSsoDialog",
} as const;

export type AuthUiVariant = (typeof authUiVariants)[keyof typeof authUiVariants];

/**
 * The server-assigned arm, or `undefined` when the page carries no recognized `auth-ui-data` value,
 * so callers can tell a visitor outside the experiment from one assigned to control.
 */
export const getAssignedAuthUiVariant = (): AuthUiVariant | undefined => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="auth-ui-data"]');
  const value = metaTag?.dataset.authUiVariant;
  return Object.values(authUiVariants).find(variant => variant === value);
};

/**
 * The shared login and signup arm, read synchronously so the page renders the right UI with no
 * flicker.
 *
 * The server resolves the assignment, logs exposure, and injects it as the `auth-ui-data` meta tag
 * on `/login` and `/CreateAccount`. A missing tag means the visitor is ineligible or the server
 * check is off, so it resolves to control rather than falling back to a client IXP fetch.
 */
export const getAuthUiVariant = (): AuthUiVariant =>
  getAssignedAuthUiVariant() ?? authUiVariants.control;
