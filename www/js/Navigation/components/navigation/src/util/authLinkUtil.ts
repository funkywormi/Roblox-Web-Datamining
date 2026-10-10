import { UrlSearchParams } from "@rbx/core-lib/url";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  getSignupRedirUrl,
  getLoginUrl,
  getNewLoginUrl,
  getAccountSwitchingSignUpUrl,
} from "../constants/urlConstants";
import { getIntAuthCompliancePolicy } from "../services/complianceService";

const getQueryParam = (paramName: string) =>
  UrlSearchParams.parse(window.location.search).get(paramName);

const composeQueryString = (params: Record<string, string>) =>
  UrlSearchParams.new(params).toSorted().toString();

export const getReturnUrl = () => {
  // return from the current page if there is no returnUrl param, except it is from login page or the signup page.
  let returnUrl = getQueryParam("returnUrl") ?? window.location.href;
  returnUrl =
    returnUrl === getLoginUrl() || returnUrl === getAccountSwitchingSignUpUrl() ? "" : returnUrl;
  return returnUrl;
};

export const getSignupUrl = (isAccountSwitcherAvailableForBrowser = false) => {
  let returnUrl;
  let signupUrl;
  if (authenticatedUser() != null && isAccountSwitcherAvailableForBrowser) {
    returnUrl = getReturnUrl();
    signupUrl = getAccountSwitchingSignUpUrl();
  } else {
    returnUrl = getQueryParam("returnUrl") ?? window.location.href;

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

export const getLoginLinkUrl = () => {
  // TODO: this should call AccountSwitcherService.isAccountSwitcherAvailable() once that is no longer an async function
  const returnUrl = getReturnUrl();
  const loginUrl = getLoginUrl();
  return `${loginUrl}?${composeQueryString({ returnUrl })}`;
};

export const isLoginLinkAvailable = () => {
  const currentPath = window.location.pathname.toLowerCase();
  return !currentPath.startsWith("/login") && !currentPath.startsWith("/newlogin");
};

export const getIsVNGLandingRedirectEnabled = async () => {
  try {
    const intAuth = await getIntAuthCompliancePolicy();
    return intAuth.isVNGComplianceEnabled ?? false;
  } catch {
    return false;
  }
};
