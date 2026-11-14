import { window as browserWindow } from "@rbx/core-lib/browser";
import { UrlSearchParams } from "@rbx/core-lib/url";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  getSignupRedirUrl,
  getLoginUrl,
  getNewLoginUrl,
  getAccountSwitchingSignUpUrl,
} from "../constants/urlConstants";
import { getNavCapability } from "./navCapabilities";
import type { NavLocation } from "./navLocation";

const currentLocation = (): NavLocation =>
  browserWindow == null
    ? { pathname: "", search: "", href: "" }
    : {
        pathname: browserWindow.location.pathname,
        search: browserWindow.location.search,
        href: browserWindow.location.href,
      };

const getQueryParam = (search: string, paramName: string) =>
  UrlSearchParams.parse(search).get(paramName);

const composeQueryString = (params: Record<string, string>) =>
  UrlSearchParams.new(params).toSorted().toString();

export const getReturnUrl = (location: NavLocation = currentLocation()) => {
  // return from the current page if there is no returnUrl param, except it is from login page or the signup page.
  let returnUrl = getQueryParam(location.search, "returnUrl") ?? location.href;
  returnUrl =
    returnUrl === getLoginUrl() || returnUrl === getAccountSwitchingSignUpUrl() ? "" : returnUrl;
  return returnUrl;
};

export const getSignupUrl = (
  isAccountSwitcherAvailableForBrowser = false,
  location: NavLocation = currentLocation(),
) => {
  let returnUrl;
  let signupUrl;
  if (authenticatedUser() != null && isAccountSwitcherAvailableForBrowser) {
    returnUrl = getReturnUrl(location);
    signupUrl = getAccountSwitchingSignUpUrl();
  } else {
    returnUrl = getQueryParam(location.search, "returnUrl") ?? location.href;

    // Do not add return url if the url points to login page in any way
    const lowerCaseReturnUrl = returnUrl.toLowerCase();
    const doesReturnUrlStartWithLoginUrl =
      lowerCaseReturnUrl.startsWith(getLoginUrl().toLowerCase()) ||
      lowerCaseReturnUrl.startsWith(getNewLoginUrl().toLowerCase());
    returnUrl = doesReturnUrlStartWithLoginUrl ? "" : returnUrl;
    signupUrl = getSignupRedirUrl();
  }
  return `${signupUrl}?${composeQueryString({ returnUrl })}`;
};

export const getLoginLinkUrl = (location: NavLocation = currentLocation()) => {
  // TODO: this should call AccountSwitcherService.isAccountSwitcherAvailable() once that is no longer an async function
  const returnUrl = getReturnUrl(location);
  const loginUrl = getLoginUrl();
  return `${loginUrl}?${composeQueryString({ returnUrl })}`;
};

export const navigateToLoginWithRedirect = () => {
  if (browserWindow != null) {
    browserWindow.location.href = getLoginLinkUrl();
  }
};

export const isLoginLinkAvailable = (location: NavLocation = currentLocation()) => {
  const currentPath = location.pathname.toLowerCase();
  return !currentPath.startsWith("/login") && !currentPath.startsWith("/newlogin");
};

export const getIsVNGLandingRedirectEnabled = async () => {
  const getIntAuthCompliancePolicy = getNavCapability("getIntAuthCompliancePolicy");
  try {
    const intAuth = await getIntAuthCompliancePolicy?.();
    return intAuth?.isVNGComplianceEnabled ?? false;
  } catch {
    return false;
  }
};
