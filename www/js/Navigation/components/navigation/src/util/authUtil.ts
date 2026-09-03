// @ts-expect-error Should be removed / fixed once React Chat is out
import angular from "angular";
import { MouseEventHandler } from "react";
import localStorageService from "@rbx/core-scripts/local-storage";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import * as http from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { handleLogoutUpsell } from "@rbx/authentication";
import { userCacheKey } from "../constants/cacheConstants";
import layoutConstants from "../constants/layoutConstants";
import {
  getSignupRedirUrl,
  getLoginUrl,
  getNewLoginUrl,
  getHomeUrl,
  getAccountSwitchingSignUpUrl,
  getRefreshSessionUrl,
} from "../constants/urlConstants";
import { getIntAuthCompliancePolicy } from "../services/complianceService";
import {
  sendCacheUserChangedAuthClientErrorEvent,
  sendLogoutButtonClickEvent,
  sendSwitchAccountButtonClickEvent,
} from "../services/eventService";
import { logout } from "../services/navigationService";

const { getQueryParam, composeQueryString } = urlService;

const { logoutEvent, loginEvent, signupEvent } = layoutConstants;
const getReturnUrl = () => {
  // return from the current page if there is no returnUrl param, except it is from login page or the signup page.
  let returnUrl = getQueryParam("returnUrl") ?? window.location.href;
  returnUrl =
    returnUrl === getLoginUrl() || returnUrl === getAccountSwitchingSignUpUrl() ? "" : returnUrl;
  return returnUrl;
};

const getSignupUrl = (isAccountSwitcherAvailableForBrowser = false) => {
  let returnUrl;
  let signupUrl;
  if (authenticatedUser() != null && isAccountSwitcherAvailableForBrowser) {
    returnUrl = getReturnUrl();
    signupUrl = getAccountSwitchingSignUpUrl();
  } else {
    returnUrl = getQueryParam("returnUrl") ?? window.location.href;

    if (Array.isArray(returnUrl)) {
      returnUrl = returnUrl[0] ?? window.location.href;
    }

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

const getLoginLinkUrl = () => {
  // TODO: this should call AccountSwitcherService.isAccountSwitcherAvailable() once that is no longer an async function
  const returnUrl = getReturnUrl();
  const loginUrl = getLoginUrl();
  return `${loginUrl}?${composeQueryString({ returnUrl })}`;
};

const logoutAndRedirect = () =>
  logout().then(() => {
    document.dispatchEvent(new CustomEvent(logoutEvent.name));
    if (!angular.isUndefined(angular.element("#chat-container").scope())) {
      const scope = angular.element("#chat-container").scope();
      scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
    }

    // clear cached user id
    localStorageService.setLocalStorage(userCacheKey, null);

    // NOTE: we should not delete keyPairs upon logout.
    // TODO: delete CrpytoKey in indexeddb when all users are signed out.
    window.location.reload();
  });

const navigateToLoginWithRedirect = () => {
  window.location.href = getLoginLinkUrl();
};

const logoutUser = async () => {
  sendLogoutButtonClickEvent();
  await handleLogoutUpsell({
    onLogout: () => {
      // TODO: onLogout should accept Promise functions
      logoutAndRedirect();
    },
  });
};

const refreshCurrentSession = async () => {
  await http.post(
    {
      url: getRefreshSessionUrl(),
      withCredentials: true,
    },
    {},
  );
};

// Account Switching
const switchAccount: MouseEventHandler = e => {
  e.stopPropagation();
  e.preventDefault();
  sendSwitchAccountButtonClickEvent(window.location.href);

  // clear cached user id
  localStorageService.setLocalStorage(userCacheKey, null);

  // destroy chat cookie after account switching
  if (!angular.isUndefined(angular.element("#chat-container").scope())) {
    const scope = angular.element("#chat-container").scope();
    scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
  }

  const containerId = "navigation-account-switcher-container";

  const switchAccountAndGoToHomePage = () => {
    localStorageService.setLocalStorage(
      layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
      true,
    );
    window.location.href = getHomeUrl();
  };

  const addAccountAndReturnOnSuccess = () => {
    window.location.href = getLoginUrl();
  };

  const AccountSwitcherParameters = {
    containerId,
    onAccountSwitched: switchAccountAndGoToHomePage,
    handleAddAccount: addAccountAndReturnOnSuccess,
  };
  // fire and forget renderAccountSwitcher
  const tryOpenAccountSwitcherModal = async () => {
    if (await AccountSwitcherService.isAccountSwitcherAvailable()) {
      // TODO: fix me
      AccountSwitcherService.renderAccountSwitcher(AccountSwitcherParameters);
    }
  };
  // TODO: fix me
  tryOpenAccountSwitcherModal();
};

const isLoginLinkAvailable = () => {
  const currentPath = window.location.pathname.toLowerCase();
  return !currentPath.startsWith("/login") && !currentPath.startsWith("/newlogin");
};

const getIsVNGLandingRedirectEnabled = async () => {
  try {
    const intAuth = await getIntAuthCompliancePolicy();
    return intAuth.isVNGComplianceEnabled ?? false;
  } catch {
    return false;
  }
};

const cacheUserId = () => {
  const currentUserId = authenticatedUser()?.id?.toString() ?? null;
  let cachedUserId = null;
  try {
    const cached = localStorageService.getLocalStorage(userCacheKey) ?? null;
    if (typeof cached === "string") {
      cachedUserId = cached;
    }
  } catch {
    // ignore error
  }
  if (cachedUserId != null && currentUserId != null && cachedUserId !== currentUserId) {
    sendCacheUserChangedAuthClientErrorEvent(
      `${currentUserId},${cachedUserId}`,
      window.location.href,
    );
  }
  localStorageService.setLocalStorage(userCacheKey, currentUserId);

  // listen for login event
  window.addEventListener(loginEvent.name, e => {
    const userId = (e as unknown as { detail: { userId?: string } }).detail.userId;
    if (userId != null) {
      localStorageService.setLocalStorage(userCacheKey, userId);
    }
  });

  // listen for signup event
  window.addEventListener(signupEvent.name, e => {
    const userId = (e as unknown as { detail: { userId?: string } }).detail.userId;
    if (userId != null) {
      localStorageService.setLocalStorage(userCacheKey, userId);
    }
  });
};

export {
  getSignupUrl,
  getLoginLinkUrl,
  logoutUser,
  logoutAndRedirect,
  refreshCurrentSession,
  isLoginLinkAvailable,
  switchAccount,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  cacheUserId,
};
