import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { navigateToPage } from "@rbx/authentication-common/utils/browserUtils";
import { qualifyAffiliateLogin } from "../../reactLanding/services/affiliateLinksService";
import { getRedirectUrl } from "./loginUtils";

const leaveLoginPageFor = (returnUrl: string): void => {
  qualifyAffiliateLogin(returnUrl);
  navigateToPage(returnUrl);
};

/**
 * Leaves the login page for its validated `returnUrl` after any sign-in method, qualifying an
 * experience affiliate link on the way out.
 */
export const navigateToLoginReturnUrl = (): void => {
  leaveLoginPageFor(getRedirectUrl());
};

/**
 * NOTE (npatel, 2026-11-04): This deviates from normal mobile behavior in that "/" always
 * redirects to the mobile download app splash page in all other cases.
 * `getRedirectUrl`, except that phones go to `/home` instead of the site root: "/" serves the
 * app-download splash to signed-in phone browsers.
 */
export const getSsoRedirectUrl = (): string => {
  const redirectUrl = getRedirectUrl();
  if (!getDeviceMeta()?.isPhone) {
    return redirectUrl;
  }
  const toUrl = (path: string) => new URL(path, window.location.origin);
  const url = toUrl(redirectUrl);
  // Compared through getAbsoluteUrl so a locale-prefixed root ("/es/") also matches.
  const rootUrl = toUrl(getAbsoluteUrl("/"));
  if (url.origin !== rootUrl.origin || url.pathname !== rootUrl.pathname) {
    return redirectUrl;
  }
  const homeUrl = toUrl(getAbsoluteUrl("/home"));
  homeUrl.search = url.search;
  homeUrl.hash = url.hash;
  return homeUrl.toString();
};

export const navigateToSsoReturnUrl = (): void => {
  leaveLoginPageFor(getSsoRedirectUrl());
};
