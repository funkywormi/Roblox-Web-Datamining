export const ACCOUNT_SETTINGS_PAGE = "/my/account";
export const QUERY = "?";
export const SHEBANG = "#!";
export const SECURITY = "/security";

export const ACCOUNT_SECURITY_SCROLL_SESSION_MANAGEMENT_QUERY = "scroll-to-session-management";

export const sessionManagementLinkWithRedirect =
  ACCOUNT_SETTINGS_PAGE +
  QUERY +
  ACCOUNT_SECURITY_SCROLL_SESSION_MANAGEMENT_QUERY +
  SECURITY +
  SHEBANG +
  SECURITY;

export const redirectToSessionManagement = (): void => {
  window.open(sessionManagementLinkWithRedirect, "_blank");
};
